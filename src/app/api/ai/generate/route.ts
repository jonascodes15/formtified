import { apiUser } from "@/lib/auth";
import { execute } from "@/lib/db";
import { fail, ok, readJson, unauthorized } from "@/lib/api";
import { AiError, checkRateLimit, generateForm } from "@/lib/ai";
import { createForm } from "@/lib/forms";

export const maxDuration = 30;

export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return unauthorized();
  const body = await readJson<{ brief?: string; answers?: { q: string; a: string }[]; title?: string }>(req);
  const brief = String(body?.brief ?? "").trim();
  if (brief.length < 15) return fail("Describe the project in a bit more detail.");
  const answers = Array.isArray(body?.answers)
    ? body.answers.slice(0, 6).map((x) => ({ q: String(x?.q ?? ""), a: String(x?.a ?? "") }))
    : [];

  try {
    await checkRateLimit(user.id);
  } catch (e) {
    if (e instanceof AiError) return fail(e.message, e.status);
    throw e;
  }

  // Take the credit first (atomic), give it back if generation fails.
  const charge = await execute("UPDATE users SET credits = credits - 1 WHERE id = $1 AND credits > 0", [user.id]);
  if (charge.rowCount === 0) return fail("You are out of credits.", 402);

  try {
    const form = await generateForm(user.id, brief, answers);
    const created = await createForm({
      userId: user.id,
      title: form.title,
      description: form.description,
      fields: form.fields,
      source: "ai",
      brief,
    });
    return ok({ ...created, title: form.title, fieldCount: form.fields.length, ms: form.ms, credits: user.credits - 1 });
  } catch (e) {
    await execute("UPDATE users SET credits = credits + 1 WHERE id = $1", [user.id]);
    if (e instanceof AiError) return fail(e.message, e.status);
    console.error(e);
    return fail("Something went wrong. Your credit was not used.", 500);
  }
}
