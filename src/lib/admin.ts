import "server-only";
import { execute, query, queryOne } from "./db";
import { appUrl, escapeHtml, sendEmailBatch } from "./email";
import { deleteStoredFiles } from "./uploads";
import type { SessionUser } from "./types";

/**
 * Every query and action used by the admin dashboard lives in this file.
 * Postgres returns COUNT(*) and SUM() as strings, so results go through num().
 */

/** Charts group days by this time zone (Nigeria). Change it if your audience is elsewhere. */
export const ADMIN_TZ = "Africa/Lagos";

export const PAGE_SIZE = 25;

const num = (v: unknown) => Number(v ?? 0);

// ---------- Overview ----------

export async function getOverview() {
  const r = await queryOne(
    `SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM users WHERE created_at > now() - interval '7 days') AS users_7d,
      (SELECT COUNT(*) FROM users WHERE created_at > now() - interval '14 days' AND created_at <= now() - interval '7 days') AS users_prev_7d,
      (SELECT COUNT(*) FROM users WHERE last_seen_at > now() - interval '1 day') AS active_1d,
      (SELECT COUNT(*) FROM users WHERE last_seen_at > now() - interval '7 days') AS active_7d,
      (SELECT COUNT(*) FROM users WHERE plan <> 'free') AS paid,
      (SELECT COUNT(*) FROM users WHERE suspended_at IS NOT NULL) AS suspended,
      (SELECT COUNT(*) FROM forms) AS forms,
      (SELECT COUNT(*) FROM forms WHERE created_at > now() - interval '7 days') AS forms_7d,
      (SELECT COUNT(*) FROM responses) AS responses,
      (SELECT COUNT(*) FROM responses WHERE created_at > now() - interval '7 days') AS responses_7d,
      (SELECT COUNT(*) FROM ai_usage WHERE kind = 'generate' AND created_at > now() - interval '30 days') AS ai_forms_30d,
      (SELECT COALESCE(SUM(prompt_tokens + completion_tokens), 0) FROM ai_usage WHERE created_at > now() - interval '30 days') AS ai_tokens_30d,
      (SELECT COUNT(DISTINCT visitor) FROM page_views
         WHERE created_at >= date_trunc('day', now() AT TIME ZONE $1) AT TIME ZONE $1) AS visitors_today,
      (SELECT COUNT(*) FROM page_views
         WHERE created_at >= date_trunc('day', now() AT TIME ZONE $1) AT TIME ZONE $1) AS views_today,
      (SELECT COUNT(DISTINCT visitor) FROM page_views WHERE created_at > now() - interval '5 minutes') AS online_now`,
    [ADMIN_TZ],
  );
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(r ?? {})) out[k] = num(v);
  return out;
}

const SERIES = {
  signups: { table: "users", value: "COUNT(*)" },
  forms: { table: "forms", value: "COUNT(*)" },
  responses: { table: "responses", value: "COUNT(*)" },
  views: { table: "page_views", value: "COUNT(*)" },
  visitors: { table: "page_views", value: "COUNT(DISTINCT visitor)" },
} as const;

export type SeriesKind = keyof typeof SERIES;

/** One value per day for the last `days` days, including days with zero. */
export async function dailySeries(kind: SeriesKind, days: number): Promise<{ day: string; value: number }[]> {
  const { table, value } = SERIES[kind];
  const rows = await query<{ day: string; value: string }>(
    `WITH days AS (
       SELECT d::date AS day
       FROM generate_series((now() AT TIME ZONE $1)::date - ($2::int - 1), (now() AT TIME ZONE $1)::date, interval '1 day') AS d
     )
     SELECT to_char(days.day, 'YYYY-MM-DD') AS day, COALESCE(t.value, 0) AS value
     FROM days
     LEFT JOIN (
       SELECT (created_at AT TIME ZONE $1)::date AS day, ${value} AS value
       FROM ${table}
       WHERE created_at >= ((now() AT TIME ZONE $1)::date - ($2::int - 1))::timestamp AT TIME ZONE $1
       GROUP BY 1
     ) t ON t.day = days.day
     ORDER BY days.day`,
    [ADMIN_TZ, days],
  );
  return rows.map((r) => ({ day: r.day, value: num(r.value) }));
}

export async function recentSignups(limit = 6) {
  return query<{ id: number; name: string; email: string; plan: string; created_at: Date }>(
    "SELECT id, name, email, plan, created_at FROM users ORDER BY created_at DESC LIMIT $1",
    [limit],
  );
}

export async function topFormsByResponses(limit = 5) {
  const rows = await query<{ id: number; title: string; slug: string; owner: string; responses: string }>(
    `SELECT f.id, f.title, f.slug, u.name AS owner, COUNT(r.id) AS responses
     FROM forms f JOIN users u ON u.id = f.user_id
     LEFT JOIN responses r ON r.form_id = f.id
     GROUP BY f.id, u.name
     HAVING COUNT(r.id) > 0
     ORDER BY COUNT(r.id) DESC, f.id DESC
     LIMIT $1`,
    [limit],
  );
  return rows.map((r) => ({ ...r, responses: num(r.responses) }));
}

/** Health checks shown on the overview: database speed and size, and which settings are filled in. */
export async function getSystemStatus() {
  const started = Date.now();
  const r = await queryOne<{ size: string }>("SELECT pg_database_size(current_database()) AS size");
  return {
    dbMs: Date.now() - started,
    dbBytes: num(r?.size),
    ai: Boolean(process.env.AI_API_KEY || process.env.GROQ_API_KEY),
    email: Boolean(process.env.RESEND_API_KEY),
    appUrl: Boolean(process.env.APP_URL),
  };
}

// ---------- Site visits ----------

export async function getTrafficSummary(days: number) {
  const r = await queryOne(
    `SELECT
      COUNT(*) FILTER (WHERE created_at > now() - make_interval(days => $1::int)) AS views,
      COUNT(DISTINCT visitor) FILTER (WHERE created_at > now() - make_interval(days => $1::int)) AS visitors,
      COUNT(*) FILTER (WHERE created_at <= now() - make_interval(days => $1::int)) AS views_prev,
      COUNT(DISTINCT visitor) FILTER (WHERE created_at <= now() - make_interval(days => $1::int)) AS visitors_prev,
      COUNT(*) FILTER (WHERE created_at > now() - make_interval(days => $1::int) AND path LIKE '/f/%') AS form_views,
      COUNT(DISTINCT visitor) FILTER (WHERE created_at > now() - interval '5 minutes') AS online
     FROM page_views
     WHERE created_at > now() - make_interval(days => $1::int * 2)`,
    [days],
  );
  return {
    views: num(r?.views),
    visitors: num(r?.visitors),
    viewsPrev: num(r?.views_prev),
    visitorsPrev: num(r?.visitors_prev),
    formViews: num(r?.form_views),
    online: num(r?.online),
  };
}

const DIMENSIONS = {
  path: "path",
  referrer: "COALESCE(referrer, '(direct)')",
  country: "COALESCE(country, '??')",
  device: "device",
  browser: "COALESCE(browser, 'Other')",
} as const;

export type Dimension = keyof typeof DIMENSIONS;

/** The top values of one column (pages, sources, countries...) with views and visitors. */
export async function topBy(dim: Dimension, days: number, limit = 8) {
  const col = DIMENSIONS[dim];
  const rows = await query<{ label: string; views: string; visitors: string }>(
    `SELECT ${col} AS label, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors
     FROM page_views
     WHERE created_at > now() - make_interval(days => $1::int)
     GROUP BY 1
     ORDER BY COUNT(*) DESC
     LIMIT $2`,
    [days, limit],
  );
  return rows.map((r) => ({ label: r.label, views: num(r.views), visitors: num(r.visitors) }));
}

// ---------- Users ----------

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  plan: string;
  credits: number;
  email_notifications: boolean;
  created_at: Date;
  last_seen_at: Date | null;
  suspended_at: Date | null;
  email_verified_at: Date | null;
  forms: number;
  responses: number;
}

export interface UserFilters {
  q?: string;
  plan?: string; // a plan name, or "paid" for every plan except free
  status?: string; // "active" | "suspended"
  sort?: string; // "newest" | "oldest" | "active" | "forms" | "credits"
  page?: number;
}

const USER_SORTS: Record<string, string> = {
  newest: "u.created_at DESC",
  oldest: "u.created_at ASC",
  active: "u.last_seen_at DESC NULLS LAST",
  forms: "forms DESC, u.created_at DESC",
  credits: "u.credits DESC, u.created_at DESC",
};

function userWhere(f: UserFilters) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (f.q?.trim()) {
    params.push(`%${f.q.trim().toLowerCase()}%`);
    where.push(`(lower(u.name) LIKE $${params.length} OR lower(u.email) LIKE $${params.length})`);
  }
  if (f.plan === "paid") where.push("u.plan <> 'free'");
  else if (f.plan) {
    params.push(f.plan);
    where.push(`u.plan = $${params.length}`);
  }
  if (f.status === "suspended") where.push("u.suspended_at IS NOT NULL");
  if (f.status === "active") where.push("u.suspended_at IS NULL");
  return { sql: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}

const USER_COLUMNS = `u.id, u.name, u.email, u.plan, u.credits, u.email_notifications, u.created_at, u.last_seen_at, u.suspended_at, u.email_verified_at,
  (SELECT COUNT(*) FROM forms f WHERE f.user_id = u.id) AS forms,
  (SELECT COUNT(*) FROM responses r JOIN forms f ON f.id = r.form_id WHERE f.user_id = u.id) AS responses`;

function hydrateUser(r: AdminUserRow): AdminUserRow {
  return { ...r, forms: num(r.forms), responses: num(r.responses) };
}

export async function listUsers(f: UserFilters, pageSize = PAGE_SIZE) {
  const { sql, params } = userWhere(f);
  const page = Math.max(1, f.page || 1);
  const order = USER_SORTS[f.sort || "newest"] ?? USER_SORTS.newest;
  const [rows, total] = await Promise.all([
    query<AdminUserRow>(
      `SELECT ${USER_COLUMNS} FROM users u ${sql} ORDER BY ${order}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, (page - 1) * pageSize],
    ),
    queryOne<{ n: string }>(`SELECT COUNT(*) AS n FROM users u ${sql}`, params),
  ]);
  return { rows: rows.map(hydrateUser), total: num(total?.n), page, pageSize };
}

/** Every matching user, for the CSV export (capped at 10,000 rows). */
export async function exportUsers(f: UserFilters) {
  const { sql, params } = userWhere(f);
  const rows = await query<AdminUserRow>(
    `SELECT ${USER_COLUMNS} FROM users u ${sql} ORDER BY u.created_at DESC LIMIT 10000`,
    params,
  );
  return rows.map(hydrateUser);
}

export async function getUserDetail(id: number) {
  const user = await queryOne<AdminUserRow>(`SELECT ${USER_COLUMNS} FROM users u WHERE u.id = $1`, [id]);
  if (!user) return null;
  const [stats, forms] = await Promise.all([
    queryOne(
      `SELECT
        (SELECT COUNT(*) FROM ai_usage WHERE user_id = $1) AS ai_calls,
        (SELECT COUNT(*) FROM ai_usage WHERE user_id = $1 AND kind = 'generate') AS ai_forms,
        (SELECT COALESCE(SUM(prompt_tokens + completion_tokens), 0) FROM ai_usage WHERE user_id = $1) AS ai_tokens,
        (SELECT COUNT(*) FROM page_views WHERE user_id = $1) AS page_views`,
      [id],
    ),
    query<{ id: number; title: string; slug: string; status: string; source: string; created_at: Date; responses: string }>(
      `SELECT f.id, f.title, f.slug, f.status, f.source, f.created_at,
         (SELECT COUNT(*) FROM responses r WHERE r.form_id = f.id) AS responses
       FROM forms f WHERE f.user_id = $1 ORDER BY f.created_at DESC LIMIT 50`,
      [id],
    ),
  ]);
  return {
    user: hydrateUser(user),
    stats: {
      aiCalls: num(stats?.ai_calls),
      aiForms: num(stats?.ai_forms),
      aiTokens: num(stats?.ai_tokens),
      pageViews: num(stats?.page_views),
    },
    forms: forms.map((f) => ({ ...f, responses: num(f.responses) })),
  };
}

export async function planBreakdown() {
  const rows = await query<{ plan: string; users: string; active_30d: string }>(
    `SELECT plan, COUNT(*) AS users,
       COUNT(*) FILTER (WHERE last_seen_at > now() - interval '30 days') AS active_30d
     FROM users GROUP BY plan ORDER BY COUNT(*) DESC`,
  );
  return rows.map((r) => ({ plan: r.plan, users: num(r.users), active30d: num(r.active_30d) }));
}

export async function emailOptInCount() {
  const r = await queryOne<{ n: string }>("SELECT COUNT(*) AS n FROM users WHERE email_notifications AND suspended_at IS NULL");
  return num(r?.n);
}

// ---------- Admin actions on users and forms ----------

export async function adjustCredits(userId: number, delta: number) {
  const r = await queryOne<{ credits: number }>(
    "UPDATE users SET credits = GREATEST(0, credits + $2) WHERE id = $1 RETURNING credits",
    [userId, delta],
  );
  return r?.credits ?? null;
}

export async function setPlan(userId: number, plan: string) {
  const res = await execute("UPDATE users SET plan = $2 WHERE id = $1", [userId, plan]);
  return res.rowCount > 0;
}

export async function setSuspended(userId: number, suspended: boolean) {
  const res = await execute(
    `UPDATE users SET suspended_at = ${suspended ? "now()" : "NULL"} WHERE id = $1`,
    [userId],
  );
  return res.rowCount > 0;
}

/** For someone who can't receive the signup code: lets them in without it. */
export async function markVerified(userId: number) {
  const res = await execute("UPDATE users SET email_verified_at = now() WHERE id = $1 AND email_verified_at IS NULL", [userId]);
  return res.rowCount > 0;
}

/** Deletes the account and, through ON DELETE CASCADE, all of its forms, responses and notifications. */
export async function deleteUser(userId: number) {
  await deleteStoredFiles({ userId });
  const res = await execute("DELETE FROM users WHERE id = $1", [userId]);
  return res.rowCount > 0;
}

export async function getUserBasic(userId: number) {
  return queryOne<{ id: number; name: string; email: string; plan: string }>(
    "SELECT id, name, email, plan FROM users WHERE id = $1",
    [userId],
  );
}

export interface AdminFormRow {
  id: number;
  title: string;
  slug: string;
  status: string;
  source: string;
  created_at: Date;
  updated_at: Date;
  user_id: number;
  owner_name: string;
  owner_email: string;
  questions: number;
  responses: number;
}

export async function listAllForms(f: { q?: string; status?: string; source?: string; page?: number }, pageSize = PAGE_SIZE) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (f.q?.trim()) {
    params.push(`%${f.q.trim().toLowerCase()}%`);
    where.push(`(lower(f.title) LIKE $${params.length} OR lower(u.email) LIKE $${params.length} OR lower(u.name) LIKE $${params.length})`);
  }
  if (f.status === "published" || f.status === "closed") {
    params.push(f.status);
    where.push(`f.status = $${params.length}`);
  }
  if (f.source) {
    params.push(f.source);
    where.push(`f.source = $${params.length}`);
  }
  const sql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const page = Math.max(1, f.page || 1);
  const [rows, total] = await Promise.all([
    query<AdminFormRow>(
      `SELECT f.id, f.title, f.slug, f.status, f.source, f.created_at, f.updated_at, f.user_id,
         u.name AS owner_name, u.email AS owner_email,
         (SELECT COUNT(*) FROM jsonb_array_elements(f.fields) e WHERE e->>'type' <> 'section') AS questions,
         (SELECT COUNT(*) FROM responses r WHERE r.form_id = f.id) AS responses
       FROM forms f JOIN users u ON u.id = f.user_id
       ${sql}
       ORDER BY f.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, (page - 1) * pageSize],
    ),
    queryOne<{ n: string }>(`SELECT COUNT(*) AS n FROM forms f JOIN users u ON u.id = f.user_id ${sql}`, params),
  ]);
  return {
    rows: rows.map((r) => ({ ...r, questions: num(r.questions), responses: num(r.responses) })),
    total: num(total?.n),
    page,
    pageSize,
  };
}

export async function setFormStatus(formId: number, status: "published" | "closed") {
  return queryOne<{ id: number; title: string }>(
    "UPDATE forms SET status = $2 WHERE id = $1 RETURNING id, title",
    [formId, status],
  );
}

export async function deleteFormAsAdmin(formId: number) {
  await deleteStoredFiles({ formId });
  return queryOne<{ id: number; title: string }>("DELETE FROM forms WHERE id = $1 RETURNING id, title", [formId]);
}

// ---------- Announcements (notifications to all users or one user) ----------

export const AUDIENCES = ["all", "free", "paid", "user"] as const;
export type Audience = (typeof AUDIENCES)[number];

/** Who receives an announcement. Suspended accounts never do. */
function audienceWhere(audience: Audience, userId: number | null): { sql: string; params: unknown[] } {
  if (audience === "user") return { sql: "id = $1 AND suspended_at IS NULL", params: [userId] };
  if (audience === "free") return { sql: "plan = 'free' AND suspended_at IS NULL", params: [] };
  if (audience === "paid") return { sql: "plan <> 'free' AND suspended_at IS NULL", params: [] };
  return { sql: "suspended_at IS NULL", params: [] };
}

export async function audienceCounts() {
  const r = await queryOne(
    `SELECT
      COUNT(*) AS "all",
      COUNT(*) FILTER (WHERE plan = 'free') AS free,
      COUNT(*) FILTER (WHERE plan <> 'free') AS paid
     FROM users WHERE suspended_at IS NULL`,
  );
  return { all: num(r?.all), free: num(r?.free), paid: num(r?.paid) };
}

export async function sendBroadcast(
  admin: SessionUser,
  b: { audience: Audience; userId: number | null; title: string; message: string; link: string | null; viaEmail: boolean },
) {
  const created = await queryOne<{ id: number }>(
    `INSERT INTO broadcasts (admin_id, audience, target_user_id, title, message, link, via_email)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [admin.id, b.audience, b.userId, b.title, b.message, b.link, b.viaEmail],
  );
  const broadcastId = created!.id;

  // One in-app notification per recipient, created in a single query.
  const { sql, params } = audienceWhere(b.audience, b.userId);
  const n = params.length;
  const inserted = await execute(
    `INSERT INTO notifications (user_id, kind, title, message, link, broadcast_id)
     SELECT id, 'admin', $${n + 1}, $${n + 2}, $${n + 3}, $${n + 4} FROM users WHERE ${sql}`,
    [...params, b.title, b.message, b.link, broadcastId],
  );

  let emailsSent = 0;
  if (b.viaEmail) {
    // Group announcements respect each user's email setting. A message to one person is always emailed.
    const optIn = b.audience === "user" ? "" : " AND email_notifications";
    const people = await query<{ email: string }>(`SELECT email FROM users WHERE ${sql}${optIn}`, params);
    const link = b.link ? (b.link.startsWith("/") ? appUrl() + b.link : b.link) : null;
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#10231a;line-height:1.5">
        <h2 style="font-size:18px;margin:0 0 12px">${escapeHtml(b.title)}</h2>
        <p style="white-space:pre-wrap">${escapeHtml(b.message)}</p>
        ${link ? `<p><a href="${escapeHtml(link)}" style="background:#4ba256;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Open</a></p>` : ""}
        <p style="color:#6b7a70;font-size:13px">You're receiving this because you have a Formtified account. You can turn emails off in Account settings.</p>
      </div>`;
    emailsSent = (await sendEmailBatch(people.map((p) => p.email), b.title, html)).sent;
  }

  await execute("UPDATE broadcasts SET recipients = $2, emails_sent = $3 WHERE id = $1", [
    broadcastId,
    inserted.rowCount,
    emailsSent,
  ]);
  return { id: broadcastId, recipients: inserted.rowCount, emailsSent };
}

export async function listBroadcasts(limit = 30) {
  const rows = await query<{
    id: number; audience: string; title: string; message: string; link: string | null; via_email: boolean;
    recipients: number; emails_sent: number; created_at: Date; admin_name: string | null; target_email: string | null; seen: string;
  }>(
    `SELECT b.id, b.audience, b.title, b.message, b.link, b.via_email, b.recipients, b.emails_sent, b.created_at,
       a.name AS admin_name, t.email AS target_email,
       (SELECT COUNT(*) FROM notifications n WHERE n.broadcast_id = b.id AND n.is_read) AS seen
     FROM broadcasts b
     LEFT JOIN users a ON a.id = b.admin_id
     LEFT JOIN users t ON t.id = b.target_user_id
     ORDER BY b.created_at DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => ({ ...r, seen: num(r.seen) }));
}

// ---------- Activity log ----------

export async function logAdminAction(admin: SessionUser, action: string, target: string | null, details?: Record<string, unknown>) {
  await execute(
    "INSERT INTO admin_audit (admin_id, admin_email, action, target, details) VALUES ($1, $2, $3, $4, $5::jsonb)",
    [admin.id, admin.email, action, target?.slice(0, 200) ?? null, details ? JSON.stringify(details) : null],
  ).catch((e) => console.error("audit log failed", e));
}

export async function listAudit(page = 1, pageSize = 50) {
  const p = Math.max(1, page);
  const [rows, total] = await Promise.all([
    query<{ id: number; admin_email: string; action: string; target: string | null; details: Record<string, unknown> | null; created_at: Date }>(
      "SELECT id, admin_email, action, target, details, created_at FROM admin_audit ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [pageSize, (p - 1) * pageSize],
    ),
    queryOne<{ n: string }>("SELECT COUNT(*) AS n FROM admin_audit"),
  ]);
  return { rows, total: num(total?.n), page: p, pageSize };
}
