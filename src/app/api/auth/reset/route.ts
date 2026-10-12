import bcrypt from "bcryptjs";
import { z } from "zod";
import { queryOne } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";
import { passwordChangedEmail, sendEmail } from "@/lib/email";
import { consumeResetToken } from "@/lib/tokens";

const schema = z.object({
  token: z.string().min(1).max(100),
  password: z.string().min(8, "Password must be at least 8 characters.").max(100),
});

/** Sets a new password from a reset link, signs out every other device, and signs this one in. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid details.");
  const { token, password } = parsed.data;

  const userId = await consumeResetToken(token);
  if (!userId) return fail("This reset link has expired or was already used. Ask for a new one.", 410);

  const hash = await bcrypt.hash(password, 10);
  // Opening the emailed link proves the person owns the address, so it also counts as verifying it.
  const user = await queryOne<{ name: string; email: string; session_version: number; suspended_at: Date | null }>(
    `UPDATE users
     SET password_hash = $2, session_version = session_version + 1, email_verified_at = COALESCE(email_verified_at, now())
     WHERE id = $1
     RETURNING name, email, session_version, suspended_at`,
    [userId, hash],
  );
  if (!user) return fail("This reset link has expired or was already used. Ask for a new one.", 410);
  if (user.suspended_at) return fail("This account has been suspended. Please contact support.", 403);

  await createSession(userId, user.session_version);
  const mail = passwordChangedEmail(user.name);
  await sendEmail(user.email, mail.subject, mail.html);
  return ok({ next: "/dashboard" });
}
