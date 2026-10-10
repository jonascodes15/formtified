import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";

export async function POST(req: Request) {
  const body = await readJson<{ email?: string; password?: string }>(req);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (!email || !password) return fail("Enter your email and password.");

  const user = await queryOne<{ id: number; password_hash: string; suspended_at: Date | null }>(
    "SELECT id, password_hash, suspended_at FROM users WHERE email = $1",
    [email],
  );
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return fail("Email or password is incorrect.", 401);
  }
  if (user.suspended_at) return fail("This account has been suspended. Please contact support.", 403);
  await createSession(user.id);
  return ok();
}
