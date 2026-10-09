import "server-only";
import crypto from "node:crypto";
import { z } from "zod";
import { asJson, query, queryOne } from "./db";
import { FIELD_TYPES, CHOICE_TYPES, type FormField, type FormRecord } from "./types";

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
export function makeSlug(len = 8) {
  const bytes = crypto.randomBytes(len);
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return s;
}

export function fieldId() {
  return "f_" + crypto.randomBytes(4).toString("hex");
}

const fieldSchema = z.object({
  id: z.string().max(40).optional(),
  type: z.string(),
  label: z.string().max(300),
  help: z.string().max(500).optional().nullable(),
  placeholder: z.string().max(200).optional().nullable(),
  required: z.boolean().optional().nullable(),
  options: z.array(z.string().max(200)).max(30).optional().nullable(),
});

/** Cleans fields coming from the AI or the editor so the DB only ever stores valid data. */
export function sanitizeFields(input: unknown): FormField[] {
  const arr = Array.isArray(input) ? input : [];
  const seen = new Set<string>();
  const out: FormField[] = [];
  for (const raw of arr.slice(0, 80)) {
    const parsed = fieldSchema.safeParse(raw);
    if (!parsed.success) continue;
    const f = parsed.data;
    const type = (FIELD_TYPES as readonly string[]).includes(f.type) ? (f.type as FormField["type"]) : "short_text";
    const label = f.label.trim();
    if (!label) continue;
    let id = f.id && /^[a-zA-Z0-9_-]+$/.test(f.id) ? f.id : fieldId();
    if (seen.has(id)) id = fieldId();
    seen.add(id);
    const field: FormField = { id, type, label };
    if (f.help?.trim()) field.help = f.help.trim();
    if (f.placeholder?.trim() && type !== "section") field.placeholder = f.placeholder.trim();
    if (type !== "section") field.required = Boolean(f.required);
    if (CHOICE_TYPES.includes(type)) {
      const opts = (f.options ?? []).map((o) => o.trim()).filter(Boolean);
      field.options = opts.length ? Array.from(new Set(opts)) : ["Option 1", "Option 2"];
    }
    out.push(field);
  }
  return out;
}

function hydrate(row: FormRecord): FormRecord {
  return { ...row, fields: asJson<FormField[]>(row.fields, []), response_count: Number(row.response_count ?? 0) };
}

export async function listForms(userId: number): Promise<FormRecord[]> {
  const rows = await query<FormRecord>(
    `SELECT f.*, (SELECT COUNT(*) FROM responses r WHERE r.form_id = f.id) AS response_count
     FROM forms f WHERE f.user_id = $1 ORDER BY f.updated_at DESC`,
    [userId],
  );
  return rows.map(hydrate);
}

export async function getOwnedForm(userId: number, id: number): Promise<FormRecord | null> {
  const row = await queryOne<FormRecord>(
    `SELECT f.*, (SELECT COUNT(*) FROM responses r WHERE r.form_id = f.id) AS response_count
     FROM forms f WHERE f.id = $1 AND f.user_id = $2`,
    [id, userId],
  );
  return row ? hydrate(row) : null;
}

export async function getFormBySlug(slug: string): Promise<(FormRecord & { owner_name: string }) | null> {
  const row = await queryOne<FormRecord & { owner_name: string }>(
    `SELECT f.*, u.name AS owner_name FROM forms f JOIN users u ON u.id = f.user_id WHERE f.slug = $1`,
    [slug],
  );
  return row ? (hydrate(row) as FormRecord & { owner_name: string }) : null;
}

export async function createForm(input: {
  userId: number;
  title: string;
  description?: string | null;
  fields: FormField[];
  source: string;
  brief?: string | null;
}): Promise<{ id: number; slug: string }> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = makeSlug();
    try {
      const row = await queryOne<{ id: number }>(
        `INSERT INTO forms (user_id, slug, title, description, fields, status, source, brief)
         VALUES ($1, $2, $3, $4, $5::jsonb, 'published', $6, $7)
         RETURNING id`,
        [
          input.userId,
          slug,
          input.title.slice(0, 200),
          input.description ?? null,
          JSON.stringify(input.fields),
          input.source,
          input.brief ?? null,
        ],
      );
      return { id: row!.id, slug };
    } catch (e: unknown) {
      // 23505 = Postgres "unique violation": the random slug is taken, so try another.
      if ((e as { code?: string }).code !== "23505") throw e;
    }
  }
  throw new Error("Could not create a unique link. Please try again.");
}
