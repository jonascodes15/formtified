import { apiUser } from "@/lib/auth";
import { asJson, query } from "@/lib/db";
import { notFound, unauthorized } from "@/lib/api";
import { getOwnedForm } from "@/lib/forms";
import type { Answers } from "@/lib/types";

function cell(v: unknown) {
  const s = Array.isArray(v) ? v.join("; ") : String(v ?? "");
  // Quote every cell, and stop spreadsheet apps from running formulas typed by clients.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser();
  if (!user) return unauthorized();
  const form = await getOwnedForm(user.id, Number((await params).id));
  if (!form) return notFound();

  const rows = await query<{ answers: unknown; created_at: Date }>(
    "SELECT answers, created_at FROM responses WHERE form_id = $1 ORDER BY created_at ASC",
    [form.id],
  );
  const questions = form.fields.filter((f) => f.type !== "section");
  const header = ["Submitted at", ...questions.map((q) => q.label)].map(cell).join(",");
  const lines = rows.map((r) => {
    const a = asJson<Answers>(r.answers, {});
    return [new Date(r.created_at).toISOString(), ...questions.map((q) => a[q.id])].map(cell).join(",");
  });
  const csv = "﻿" + [header, ...lines].join("\r\n");
  const filename = form.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "responses";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}-responses.csv"`,
    },
  });
}
