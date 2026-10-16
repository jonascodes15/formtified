import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { asJson, queryOne } from "@/lib/db";
import { filesForResponses } from "@/lib/uploads";
import { formatDate } from "@/lib/format";
import { Logo } from "@/components/Logo";
import { PrintButton } from "@/components/app/PrintButton";
import type { Answers, BriefSummary, FormField } from "@/lib/types";

export const metadata: Metadata = { title: "Project brief", robots: { index: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ print?: string }> };

/** A clean, printable page for one response: the AI brief (if written) and every answer. "Save as PDF" from the print dialog. */
export default async function BriefPage({ params, searchParams }: Props) {
  const user = await requireUser();
  const row = await queryOne<{
    id: number; answers: unknown; summary: unknown; respondent_name: string | null; respondent_email: string | null; created_at: Date; title: string; fields: unknown;
  }>(
    `SELECT r.id, r.answers, r.summary, r.respondent_name, r.respondent_email, r.created_at, f.title, f.fields
     FROM responses r JOIN forms f ON f.id = r.form_id WHERE r.id = $1 AND f.user_id = $2`,
    [Number((await params).id), user.id],
  );
  if (!row) notFound();

  const fields = asJson<FormField[]>(row.fields, []);
  const answers = asJson<Answers>(row.answers, {});
  const summary = asJson<BriefSummary | null>(row.summary, null);
  const files = await filesForResponses([row.id]);
  const client = row.respondent_name || row.respondent_email || "Client";

  return (
    <main className="mx-auto max-w-3xl bg-white px-6 py-10 text-ink print:max-w-none print:p-0">
      <div className="mb-8 flex items-center justify-between gap-4 print:hidden">
        <p className="text-sm text-muted">Choose &ldquo;Save as PDF&rdquo; in the print window to download this brief.</p>
        <PrintButton auto={(await searchParams).print === "1"} />
      </div>

      <header className="flex items-start justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-700">Project brief</p>
          <h1 className="display mt-2 text-3xl font-semibold leading-tight">{client}</h1>
          <p className="mt-1 text-muted">{row.title} · submitted {formatDate(row.created_at, true)}</p>
          {row.respondent_email && <p className="text-sm text-muted">{row.respondent_email}</p>}
        </div>
        <Logo />
      </header>

      {summary && (
        <section className="mt-8 break-inside-avoid">
          <h2 className="display text-xl font-semibold">Summary</h2>
          {summary.overview && <p className="mt-2 leading-relaxed">{summary.overview}</p>}
          {(summary.budget || summary.timeline) && (
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {summary.budget && <Fact label="Budget" value={summary.budget} />}
              {summary.timeline && <Fact label="Timeline" value={summary.timeline} />}
            </dl>
          )}
          <Bullets title="Goals" items={summary.goals} />
          <Bullets title="Scope" items={summary.scope} />
          <Bullets title="Notes" items={summary.notes} />
          <Bullets title="Watch out for" items={summary.risks} />
          <Bullets title="Questions to ask before quoting" items={summary.missing} numbered />
          <p className="mt-4 text-xs text-soft">Summary written by AI from the client&apos;s answers.</p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="display text-xl font-semibold">{summary ? "Full answers" : "Answers"}</h2>
        <dl className="mt-3">
          {fields.map((f) => {
            if (f.type === "section") return <h3 key={f.id} className="mt-6 break-after-avoid font-semibold text-brand-700">{f.label}</h3>;
            const a = answers[f.id];
            const text =
              f.type === "file"
                ? files.filter((x) => x.field_id === f.id).map((x) => x.name).join(", ")
                : Array.isArray(a) ? a.join(", ") : a;
            return (
              <div key={f.id} className="break-inside-avoid border-b border-line py-3">
                <dt className="text-sm text-muted">{f.label}</dt>
                <dd className={`mt-1 whitespace-pre-wrap ${text ? "" : "italic text-soft"}`}>{text || "No answer"}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      <footer className="mt-10 text-xs text-soft">Made with Formtified · formtified.com</footer>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line px-4 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function Bullets({ title, items, numbered }: { title: string; items: string[]; numbered?: boolean }) {
  if (!items.length) return null;
  const List = numbered ? "ol" : "ul";
  return (
    <div className="mt-5 break-inside-avoid">
      <h3 className="font-semibold">{title}</h3>
      <List className={`mt-1.5 space-y-1 pl-5 ${numbered ? "list-decimal" : "list-disc"}`}>
        {items.map((x) => <li key={x}>{x}</li>)}
      </List>
    </div>
  );
}
