import { apiUser } from "@/lib/auth";
import { execute, queryOne } from "@/lib/db";
import { deleteStoredFiles } from "@/lib/uploads";
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
  const id = Number((await params).id);
  const owned = await queryOne(`SELECT id FROM responses WHERE ${OWNED}`, [id, user.id]);
  if (!owned) return notFound();
  await deleteStoredFiles({ responseId: id });
  await execute("DELETE FROM responses WHERE id = $1", [id]);
  return ok();
}
