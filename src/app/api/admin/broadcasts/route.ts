import { apiAdmin } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";
import { queryOne } from "@/lib/db";
import { AUDIENCES, logAdminAction, sendBroadcast, type Audience } from "@/lib/admin";

// Sending emails to many users can take a while.
export const maxDuration = 60;

/** Only links inside the app ("/templates") or full https:// links are allowed. */
function cleanLink(raw: unknown) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (/^\/(?!\/)[^\s]{0,299}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.protocol === "https:" && s.length <= 300) return s;
  } catch {}
  return undefined;
}

export async function POST(req: Request) {
  const admin = await apiAdmin();
  if (!admin) return fail("Not found.", 404);
  const body = await readJson<{ audience?: string; userId?: number; email?: string; title?: string; message?: string; link?: string; viaEmail?: boolean }>(req);
  if (!body) return fail("Invalid request.");

  const audience = body.audience as Audience;
  if (!AUDIENCES.includes(audience)) return fail("Choose who to send to.");
  const title = String(body.title ?? "").trim().slice(0, 120);
  const message = String(body.message ?? "").trim().slice(0, 1000);
  if (!title || !message) return fail("Add a title and a message.");
  const link = cleanLink(body.link);
  if (link === undefined) return fail("The link must start with / (a page in the app) or https://.");

  let userId: number | null = null;
  let target: string | null = audience;
  if (audience === "user") {
    const user = body.userId
      ? await queryOne<{ id: number; email: string; suspended_at: Date | null }>("SELECT id, email, suspended_at FROM users WHERE id = $1", [Number(body.userId)])
      : await queryOne<{ id: number; email: string; suspended_at: Date | null }>("SELECT id, email, suspended_at FROM users WHERE email = $1", [String(body.email ?? "").trim().toLowerCase()]);
    if (!user) return fail("No user has that email address.", 404);
    if (user.suspended_at) return fail("That account is suspended, so it can't receive messages.");
    userId = user.id;
    target = user.email;
  }

  const result = await sendBroadcast(admin, { audience, userId, title, message, link, viaEmail: Boolean(body.viaEmail) });
  await logAdminAction(admin, "broadcast.send", target, { title, recipients: result.recipients, emails: result.emailsSent });
  return ok(result);
}
