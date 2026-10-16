import { del, list } from "@vercel/blob";
import { execute, query } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { uploadsEnabled } from "@/lib/uploads";

export const maxDuration = 60;

/**
 * Runs once a day (see vercel.json). Vercel calls it with "Authorization: Bearer <CRON_SECRET>".
 * It deletes files that were uploaded but never submitted (the client closed the form, or removed the file),
 * and old upload-limit records.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return fail("Set CRON_SECRET to enable the daily clean-up.", 503);
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return fail("Unauthorized.", 401);

  await execute("DELETE FROM upload_tokens WHERE created_at < now() - interval '2 days'");
  if (!uploadsEnabled()) return ok({ ok: true, deleted: 0 });

  // Give clients a full day to finish the form before their files count as abandoned.
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  let cursor: string | undefined;
  let deleted = 0;
  do {
    const page = await list({ prefix: "responses/", limit: 1000, cursor });
    cursor = page.hasMore ? page.cursor : undefined;
    const old = page.blobs.filter((b) => new Date(b.uploadedAt).getTime() < cutoff);
    if (!old.length) continue;
    const kept = new Set(
      (await query<{ url: string }>("SELECT url FROM uploads WHERE url = ANY($1::text[])", [old.map((b) => b.url)])).map((r) => r.url),
    );
    const orphans = old.filter((b) => !kept.has(b.url)).map((b) => b.url);
    if (orphans.length) {
      await del(orphans);
      deleted += orphans.length;
    }
  } while (cursor);

  return ok({ ok: true, deleted });
}
