import { execute, queryOne } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/api";
import { getFormBySlug } from "@/lib/forms";
import { appUrl, escapeHtml, sendEmail } from "@/lib/email";
import { saveResponseFiles, uploadsEnabled, verifySubmittedFiles } from "@/lib/uploads";
import type { Answers } from "@/lib/types";

/** A client submits a filled form. No sign-in needed. */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);
  if (!form) return fail("This form does not exist.", 404);
  if (form.status !== "published") return fail("This form is no longer accepting responses.", 403);

  const body = await readJson<{ answers?: Record<string, unknown>; files?: unknown; website?: string }>(req);
  if (!body?.answers || typeof body.answers !== "object") return fail("Invalid submission.");
  if (body.website) return ok(); // honeypot field filled = bot. Pretend success.

  const files = await verifySubmittedFiles(form, body.files);
  const answers: Answers = {};
  const missing: string[] = [];
  for (const field of form.fields) {
    if (field.type === "section") continue;
    const raw = body.answers[field.id];
    let value: string | string[] = "";
    if (field.type === "file") {
      // If uploads are switched off, nobody can answer a file question, so don't block the form on it.
      if (!uploadsEnabled()) continue;
      // The answer is the list of file names; the files themselves are saved below.
      value = (files.get(field.id) ?? []).map((f) => f.name);
    } else if (field.type === "multi_choice") {
      value = Array.isArray(raw) ? raw.map((v) => String(v).slice(0, 200)).filter((v) => field.options?.includes(v) || v.startsWith("Other: ")).slice(0, 30) : [];
    } else {
      value = String(raw ?? "").trim().slice(0, 10000);
    }
    const empty = Array.isArray(value) ? value.length === 0 : value === "";
    if (field.required && empty) missing.push(field.label);
    if (!empty) answers[field.id] = value;
  }
  if (missing.length) return fail(`Please answer: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`);

  const emailField = form.fields.find((f) => f.type === "email");
  const nameField = form.fields.find((f) => f.type === "short_text" && /name/i.test(f.label) && !/business|company|brand/i.test(f.label));
  const respondentEmail = emailField ? String(answers[emailField.id] ?? "").slice(0, 190) || null : null;
  const respondentName = nameField ? String(answers[nameField.id] ?? "").slice(0, 200) || null : null;

  const res = await queryOne<{ id: number }>(
    "INSERT INTO responses (form_id, answers, respondent_name, respondent_email) VALUES ($1, $2::jsonb, $3, $4) RETURNING id",
    [form.id, JSON.stringify(answers), respondentName, respondentEmail],
  );
  const responseId = res!.id;
  await saveResponseFiles(form.id, responseId, [...files.values()].flat());

  const who = respondentName || respondentEmail || "Someone";
  await execute("INSERT INTO notifications (user_id, form_id, response_id, message) VALUES ($1, $2, $3, $4)", [
    form.user_id,
    form.id,
    responseId,
    `${who} filled "${form.title}"`.slice(0, 300),
  ]);

  const owner = await queryOne<{ email: string; name: string; email_notifications: boolean }>(
    "SELECT email, name, email_notifications FROM users WHERE id = $1",
    [form.user_id],
  );
  if (owner?.email_notifications) {
    const link = `${appUrl()}/responses?form=${form.id}&r=${responseId}`;
    await sendEmail(
      owner.email,
      `New response: ${form.title}`,
      `<div style="font-family:Arial,sans-serif;font-size:15px;color:#10231a">
        <p>Hi ${escapeHtml(owner.name.split(" ")[0])},</p>
        <p><b>${escapeHtml(who)}</b> just filled <b>${escapeHtml(form.title)}</b>.</p>
        <p><a href="${link}" style="background:#4ba256;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">View response</a></p>
        <p style="color:#6b7a70;font-size:13px">You can turn these emails off in Account settings on Formtified.</p>
      </div>`,
    );
  }
  return ok();
}
