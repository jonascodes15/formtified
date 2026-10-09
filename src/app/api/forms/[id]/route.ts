import { apiUser } from "@/lib/auth";
import { execute } from "@/lib/db";
import { fail, notFound, ok, readJson, unauthorized } from "@/lib/api";
import { getOwnedForm, sanitizeFields } from "@/lib/forms";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const user = await apiUser();
  if (!user) return unauthorized();
  const form = await getOwnedForm(user.id, Number((await params).id));
  if (!form) return notFound();

  const body = await readJson<{ title?: string; description?: string | null; fields?: unknown; status?: string }>(req);
  if (!body) return fail("Invalid request.");

  const title = body.title !== undefined ? String(body.title).trim().slice(0, 200) || "Untitled form" : form.title;
  const description =
    body.description !== undefined ? String(body.description ?? "").trim().slice(0, 1000) || null : form.description;
  const fields = body.fields !== undefined ? sanitizeFields(body.fields) : form.fields;
  const status = body.status === "closed" || body.status === "published" ? body.status : form.status;
  if (fields.filter((f) => f.type !== "section").length === 0) return fail("A form needs at least one question.");

  // updated_at is refreshed automatically by a database trigger (see db/schema.sql).
  await execute("UPDATE forms SET title = $1, description = $2, fields = $3::jsonb, status = $4 WHERE id = $5", [
    title,
    description,
    JSON.stringify(fields),
    status,
    form.id,
  ]);
  return ok({ ok: true, fields });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await apiUser();
  if (!user) return unauthorized();
  const res = await execute("DELETE FROM forms WHERE id = $1 AND user_id = $2", [Number((await params).id), user.id]);
  if (!res.rowCount) return notFound();
  return ok();
}
