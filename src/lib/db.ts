import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Neon's HTTP driver: every query is a single HTTPS request, so there is no
// connection pool to manage. That suits Vercel's serverless functions.
// SQL uses Postgres placeholders: $1, $2, $3 ... (not ?).
let sql: NeonQueryFunction<false, true> | undefined;

export function db(): NeonQueryFunction<false, true> {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set. See README.md.");
    sql = neon(url, { fullResults: true });
  }
  return sql;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T = Record<string, any>>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await db().query(text, params);
  return res.rows as T[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function queryOne<T = Record<string, any>>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** For INSERT / UPDATE / DELETE. rowCount = how many rows were changed. */
export async function execute(text: string, params: unknown[] = []): Promise<{ rowCount: number }> {
  const res = await db().query(text, params);
  return { rowCount: res.rowCount ?? 0 };
}

/** JSONB columns come back already parsed. This also handles a plain JSON string, just in case. */
export function asJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}
