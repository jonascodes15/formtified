import { apiAdmin } from "@/lib/auth";
import { fail, notFound, ok, readJson } from "@/lib/api";
import { deleteFormAsAdmin, logAdminAction, setFormStatus } from "@/lib/admin";

type Ctx = { params: Promise<{ id: string }> };

/** Close or reopen any user's form: { status: "closed" | "published" } */
export async function PATCH(req: Request, { params }: Ctx) {
  const admin = await apiAdmin();
  if (!admin) return fail("Not found.", 404);
  const body = await readJson<{ status?: string }>(req);
  if (body?.status !== "closed" && body?.status !== "published") return fail("Unknown status.");
  const form = await setFormStatus(Number((await params).id) || 0, body.status);
  if (!form) return notFound();
  await logAdminAction(admin, body.status === "closed" ? "form.close" : "form.reopen", form.title, { formId: form.id });
  return ok();
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const admin = await apiAdmin();
  if (!admin) return fail("Not found.", 404);
  const form = await deleteFormAsAdmin(Number((await params).id) || 0);
  if (!form) return notFound();
  await logAdminAction(admin, "form.delete", form.title, { formId: form.id });
  return ok();
}
