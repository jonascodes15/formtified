import { apiUser } from "@/lib/auth";
import { asJson, execute, queryOne } from "@/lib/db";
import { fail, notFound, ok, readJson, unauthorized } from "@/lib/api";
import { AiError, checkRateLimit, summarizeResponse } from "@/lib/ai";
import { SUMMARY_COST } from "@/lib/credits";
import type { Answers, FormField } from "@/lib/types";

export const maxDuration = 30;

/**
 * Writes the AI brief for one response and saves it. Uses SUMMARY_COST credits;
 * asking again for a saved brief is free unless "regenerate" is set.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser();
  if (!user) return unauthorized();
  const row = await queryOne<{ id: number; answers: unknown; summary: unknown; summary_at: Date | null; title: string; fields: unknown }>(
    `SELECT r.id, r.answers, r.summary, r.summary_at, f.title, f.fields
     FROM responses r JOIN forms f ON f.id = r.form_id
     WHERE r.id = $1 AND f.user_id = $2`,
    [Number((await params).id), user.id],
  );
  if (!row) return notFound();

  const body = await readJson<{ regenerate?: boolean }>(req);
  if (row.summary && !body?.regenerate) {
    return ok({ summary: row.summary, summary_at: row.summary_at, credits: user.credits });
  }

  try {
    await checkRateLimit(user.id);
  } catch (e) {
    if (e instanceof AiError) return fail(e.message, e.status);
    throw e;
  }

  // Take the credit first (atomic), give it back if the AI fails.
  const charge = await execute("UPDATE users SET credits = credits - $2 WHERE id = $1 AND credits >= $2", [user.id, SUMMARY_COST]);
  if (charge.rowCount === 0) return fail("You are out of credits. Buy a credit pack to summarise responses.", 402);

  try {
    const summary = await summarizeResponse(
      user.id,
      { title: row.title, fields: asJson<FormField[]>(row.fields, []) },
      asJson<Answers>(row.answers, {}),
    );
    const saved = await queryOne<{ summary_at: Date }>(
      "UPDATE responses SET summary = $2::jsonb, summary_at = now() WHERE id = $1 RETURNING summary_at",
      [row.id, JSON.stringify(summary)],
    );
    return ok({ summary, summary_at: saved?.summary_at, credits: user.credits - SUMMARY_COST });
  } catch (e) {
    await execute("UPDATE users SET credits = credits + $2 WHERE id = $1", [user.id, SUMMARY_COST]);
    if (e instanceof AiError) return fail(e.message, e.status);
    console.error(e);
    return fail("Something went wrong. Your credit was not used.", 500);
  }
}
