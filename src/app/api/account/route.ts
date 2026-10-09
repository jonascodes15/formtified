import bcrypt from "bcryptjs";
import { apiUser } from "@/lib/auth";
import { execute, queryOne } from "@/lib/db";
import { fail, ok, readJson, unauthorized } from "@/lib/api";

export async function PATCH(req: Request) {
  const user = await apiUser();
  if (!user) return unauthorized();
  const body = await readJson<{
    name?: string;
    email_notifications?: boolean;
    currentPassword?: string;
    newPassword?: string;
  }>(req);
  if (!body) return fail("Invalid request.");

  if (body.newPassword !== undefined) {
    if (String(body.newPassword).length < 8) return fail("New password must be at least 8 characters.");
    const row = await queryOne<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = $1", [user.id]);
    if (!row || !(await bcrypt.compare(String(body.currentPassword ?? ""), row.password_hash))) {
      return fail("Current password is incorrect.");
    }
    await execute("UPDATE users SET password_hash = $1 WHERE id = $2", [await bcrypt.hash(body.newPassword, 10), user.id]);
    return ok();
  }

  const name = body.name !== undefined ? String(body.name).trim().slice(0, 120) : user.name;
  if (name.length < 2) return fail("Enter your name.");
  const notify = body.email_notifications !== undefined ? Boolean(body.email_notifications) : user.email_notifications;
  await execute("UPDATE users SET name = $1, email_notifications = $2 WHERE id = $3", [name, notify, user.id]);
  return ok();
}
