import { apiUser } from "@/lib/auth";
import { execute } from "@/lib/db";
import { notFound, ok, unauthorized } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

const OWNED = "id = $1 AND form_id IN (SELECT id FROM forms WHERE user_id = $2)";

/** Mark a response as read. */
export async function PATCH(_req: Request, { params }: Ctx) {
  const user = await apiUser();
  if (!user) return unauthorized();
  await execute(`UPDATE responses SET is_read = true WHERE ${OWNED}`, [Number((await params).id), user.id]);
  return ok();
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await apiUser();
  if (!user) return unauthorized();
  const res = await execute(`DELETE FROM responses WHERE ${OWNED}`, [Number((await params).id), user.id]);
  if (!res.rowCount) return notFound();
  return ok();
}
