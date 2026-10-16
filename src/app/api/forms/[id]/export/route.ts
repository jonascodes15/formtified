import { apiUser } from "@/lib/auth";
import { asJson, query } from "@/lib/db";
import { notFound, unauthorized } from "@/lib/api";
import { getOwnedForm } from "@/lib/forms";
import { csvCell } from "@/lib/format";
import { appUrl } from "@/lib/email";
import { filesForResponses } from "@/lib/uploads";
import type { Answers } from "@/lib/types";

const cell = csvCell;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser();
  if (!user) return unauthorized();
  const form = await getOwnedForm(user.id, Number((await params).id));
  if (!form) return notFound();

  const rows = await query<{ id: number; answers: unknown; created_at: Date }>(
    "SELECT id, answers, created_at FROM responses WHERE form_id = $1 ORDER BY created_at ASC",
    [form.id],
  );
  const files = await filesForResponses(rows.map((r) => r.id));
  const base = appUrl();
  const questions = form.fields.filter((f) => f.type !== "section");
  const header = ["Submitted at", ...questions.map((q) => q.label)].map(cell).join(",");
  const lines = rows.map((r) => {
    const a = asJson<Answers>(r.answers, {});
    // File questions list each file with a link that opens it (you need to be signed in).
    const answer = (q: (typeof questions)[number]) =>
      q.type === "file"
        ? files.filter((f) => f.response_id === r.id && f.field_id === q.id).map((f) => `${f.name} (${base}/api/files/${f.id})`).join("\n")
        : a[q.id];
    return [new Date(r.created_at).toISOString(), ...questions.map(answer)].map(cell).join(",");
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
