import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";
import { hasLiveVerifyCode, sendVerifyCode } from "@/lib/tokens";

export async function POST(req: Request) {
  const body = await readJson<{ email?: string; password?: string }>(req);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (!email || !password) return fail("Enter your email and password.");

  const user = await queryOne<{
    id: number;
    name: string;
    password_hash: string;
    suspended_at: Date | null;
    session_version: number;
    verified: boolean;
  }>(
    `SELECT id, name, password_hash, suspended_at, session_version, email_verified_at IS NOT NULL AS verified
     FROM users WHERE email = $1`,
    [email],
  );
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return fail("Email or password is incorrect.", 401);
  }
  if (user.suspended_at) return fail("This account has been suspended. Please contact support.", 403);
  await createSession(user.id, user.session_version);
  if (user.verified) return ok({ next: "/dashboard" });

  // Signed up but never entered the code: send a fresh one unless the last one still works.
  if (!(await hasLiveVerifyCode(user.id))) await sendVerifyCode({ id: user.id, name: user.name, email });
  return ok({ next: "/verify" });
}
