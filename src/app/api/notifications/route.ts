import { apiUser } from "@/lib/auth";
import { execute, query } from "@/lib/db";
import { ok, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await apiUser();
  if (!user) return unauthorized();
  const items = await query(
    `SELECT id, form_id, response_id, message, is_read, created_at
     FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
    [user.id],
  );
  const unread = items.filter((n) => !n.is_read).length;
  return ok({ items, unread });
}

/** Marks all notifications as read. */
export async function POST() {
  const user = await apiUser();
  if (!user) return unauthorized();
  await execute("UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false", [user.id]);
  return ok();
}
