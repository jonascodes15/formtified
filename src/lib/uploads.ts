import "server-only";
import { del, head } from "@vercel/blob";
import { execute, query, queryOne } from "./db";
import { UPLOAD_MAX_BYTES, UPLOAD_MAX_FILES, safeFileName, uploadFolder } from "./files";
import type { FormRecord } from "./types";

/**
 * Client files are stored in Vercel Blob as *private* files: nobody can open them from their storage address.
 * Form owners open them through /api/files/<id>, which checks they own the form.
 * Uploads are switched on by connecting a Blob store to the Vercel project (it adds BLOB_READ_WRITE_TOKEN).
 */
export function uploadsEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Uploads one form can start per hour, so a public link can't be used to fill the storage. */
const HOURLY_UPLOADS_PER_FORM = 100;

export interface UploadRow {
  id: number;
  response_id: number;
  field_id: string;
  name: string;
  size: number;
  content_type: string;
}

/**
 * Checks a client's request to upload a file to a form, before the browser is given permission to upload it.
 * Throws a message for the client if it isn't allowed.
 */
export async function checkUploadRequest(form: FormRecord, pathname: string) {
  if (!uploadsEnabled()) throw new Error("File uploads aren't available right now.");
  if (form.status !== "published") throw new Error("This form is no longer accepting responses.");
  const m = pathname.match(/^responses\/([a-z0-9]+)\/([A-Za-z0-9_-]{1,40})\/([A-Za-z0-9._-]{1,100})$/);
  const field = m && m[1] === form.slug ? form.fields.find((f) => f.id === m[2] && f.type === "file") : null;
  if (!m || !field || safeFileName(m[3]) !== m[3]) throw new Error("This file can't be uploaded here.");

  const recent = await queryOne<{ n: string }>(
    "SELECT COUNT(*) AS n FROM upload_tokens WHERE form_id = $1 AND created_at > now() - interval '1 hour'",
    [form.id],
  );
  if (Number(recent?.n ?? 0) >= HOURLY_UPLOADS_PER_FORM) throw new Error("Too many files have been uploaded to this form. Please try again later.");
  await execute("INSERT INTO upload_tokens (form_id) VALUES ($1)", [form.id]);
}

export interface SubmittedFile {
  url: string;
  name: string;
}

export interface VerifiedFile {
  fieldId: string;
  url: string;
  pathname: string;
  name: string;
  size: number;
  contentType: string;
}

/**
 * Checks the files sent with a response: each must be in this form's folder for that question
 * and really exist in storage. Size and type come from storage, not from the browser.
 */
export async function verifySubmittedFiles(form: FormRecord, raw: unknown): Promise<Map<string, VerifiedFile[]>> {
  const out = new Map<string, VerifiedFile[]>();
  if (!uploadsEnabled() || !raw || typeof raw !== "object") return out;
  const checks: Promise<void>[] = [];
  for (const field of form.fields) {
    if (field.type !== "file") continue;
    const list = (raw as Record<string, unknown>)[field.id];
    if (!Array.isArray(list)) continue;
    const folder = uploadFolder(form.slug, field.id);
    const files: VerifiedFile[] = [];
    out.set(field.id, files);
    for (const item of list.slice(0, UPLOAD_MAX_FILES)) {
      const { url, name } = (item ?? {}) as Partial<SubmittedFile>;
      let parsed: URL;
      try {
        parsed = new URL(String(url));
      } catch {
        continue;
      }
      const pathname = decodeURIComponent(parsed.pathname.slice(1));
      if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".blob.vercel-storage.com") || !pathname.startsWith(folder)) continue;
      checks.push(
        head(parsed.href)
          .then((b) => {
            if (b.size > UPLOAD_MAX_BYTES) return;
            files.push({
              fieldId: field.id,
              url: b.url,
              pathname: b.pathname,
              name: String(name ?? "").trim().slice(0, 200) || pathname.split("/").pop()!,
              size: b.size,
              contentType: b.contentType.slice(0, 120),
            });
          })
          .catch(() => {}),
      );
    }
  }
  await Promise.all(checks);
  return out;
}

export async function saveResponseFiles(formId: number, responseId: number, files: VerifiedFile[]) {
  if (!files.length) return;
  const values: string[] = [];
  const params: unknown[] = [];
  files.forEach((f, i) => {
    const p = i * 8;
    values.push(`($${p + 1}, $${p + 2}, $${p + 3}, $${p + 4}, $${p + 5}, $${p + 6}, $${p + 7}, $${p + 8})`);
    params.push(formId, responseId, f.fieldId, f.url, f.pathname, f.name, f.size, f.contentType);
  });
  await execute(
    `INSERT INTO uploads (form_id, response_id, field_id, url, pathname, name, size, content_type)
     VALUES ${values.join(", ")} ON CONFLICT (url) DO NOTHING`,
    params,
  );
}

/** The files attached to these responses, for showing in the dashboard. */
export async function filesForResponses(responseIds: number[]): Promise<UploadRow[]> {
  if (!responseIds.length) return [];
  return query<UploadRow>(
    "SELECT id, response_id, field_id, name, size, content_type FROM uploads WHERE response_id = ANY($1::int[]) ORDER BY id",
    [responseIds],
  );
}

/**
 * Removes stored files. Call it before deleting the rows that point at them;
 * anything missed is removed by the daily clean-up (src/app/api/cron/cleanup).
 */
export async function deleteStoredFiles(where: { responseId: number } | { formId: number } | { userId: number }) {
  if (!uploadsEnabled()) return;
  const rows =
    "responseId" in where
      ? await query<{ url: string }>("SELECT url FROM uploads WHERE response_id = $1", [where.responseId])
      : "formId" in where
        ? await query<{ url: string }>("SELECT url FROM uploads WHERE form_id = $1", [where.formId])
        : await query<{ url: string }>("SELECT u.url FROM uploads u JOIN forms f ON f.id = u.form_id WHERE f.user_id = $1", [where.userId]);
  for (let i = 0; i < rows.length; i += 500) {
    await del(rows.slice(i, i + 500).map((r) => r.url)).catch((e) => console.error("blob delete failed", e));
  }
}
