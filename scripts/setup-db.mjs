// Creates all tables in the Neon database from db/schema.sql.
// Usage: npm run db:setup   (reads DATABASE_URL from .env.local)
import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

// The HTTP driver runs one statement per call, so split the file on ";".
// Semicolons inside $$ ... $$ blocks, 'strings' and -- comments are ignored.
function splitStatements(text) {
  const out = [];
  let cur = "";
  let inQuote = false;
  let inDollar = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (!inQuote && !inDollar && ch === "-" && text[i + 1] === "-") {
      while (i < text.length && text[i] !== "\n") i++;
      cur += "\n";
      continue;
    }
    if (!inQuote && ch === "$" && text[i + 1] === "$") {
      inDollar = !inDollar;
      cur += "$$";
      i++;
      continue;
    }
    if (!inDollar && ch === "'") inQuote = !inQuote;
    if (!inQuote && !inDollar && ch === ";") {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const sql = neon(url);
const schema = fs.readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8");
const statements = splitStatements(schema);

try {
  // One transaction: either every statement succeeds, or nothing changes.
  await sql.transaction(statements.map((s) => sql.query(s)));
  const rows = await sql.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
  );
  console.log(`Ran ${statements.length} statements.`);
  console.log("Tables ready:", rows.map((r) => r.table_name).join(", "));
} catch (e) {
  console.error("Database setup failed:", e.message);
  process.exit(1);
}
