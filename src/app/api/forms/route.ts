import { apiUser } from "@/lib/auth";
import { fail, ok, readJson, unauthorized } from "@/lib/api";
import { createForm, fieldId, getOwnedForm } from "@/lib/forms";
import { getTemplate } from "@/lib/templates";

/** Create a form from a template, as a blank form, or as a copy of another form. */
export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return unauthorized();
  const body = await readJson<{ template?: string; copyOf?: number; blank?: boolean }>(req);

  if (body?.template) {
    const t = getTemplate(body.template);
    if (!t) return fail("Template not found.", 404);
    const fields = t.fields.map((f) => ({ ...f, id: fieldId() }));
    return ok(await createForm({ userId: user.id, title: t.title, description: t.description, fields, source: "template" }));
  }

  if (body?.copyOf) {
    const src = await getOwnedForm(user.id, Number(body.copyOf));
    if (!src) return fail("Form not found.", 404);
    return ok(
      await createForm({
        userId: user.id,
        title: `${src.title} (Copy)`,
        description: src.description,
        fields: src.fields,
        source: "copy",
        brief: src.brief,
      }),
    );
  }

  return ok(
    await createForm({
      userId: user.id,
      title: "Untitled form",
      description: null,
      fields: [
        { id: fieldId(), type: "short_text", label: "Full name", required: true },
        { id: fieldId(), type: "email", label: "Email address", required: true },
      ],
      source: "blank",
    }),
  );
}
