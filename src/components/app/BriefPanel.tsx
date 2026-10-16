"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Copy, FileDown, HelpCircle, MessageCircle, RefreshCw, Sparkles } from "lucide-react";
import type { BriefSummary } from "@/lib/types";
import { SUMMARY_COST } from "@/lib/credits";

/** The AI brief for one response: a button to create it, then the brief with PDF, copy and WhatsApp actions. */
export function BriefPanel({
  responseId,
  summary,
  credits,
  clientName,
  onSummary,
}: {
  responseId: number;
  summary: BriefSummary | null;
  credits: number;
  clientName: string;
  onSummary: (s: BriefSummary, credits: number) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function create(regenerate = false) {
    if (regenerate && !confirm(`Write a new brief? This uses ${SUMMARY_COST} credit.`)) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/responses/${responseId}/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerate }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not write the brief. Please try again.");
      return;
    }
    onSummary(data.summary, data.credits);
    router.refresh();
  }

  if (!summary) {
    const out = credits < SUMMARY_COST;
    return (
      <div className="rounded-3xl bg-forest p-5 text-white sm:p-6">
        <p className="flex items-center gap-2 font-semibold"><Sparkles className="size-4 text-lime" /> Turn this response into a one-page brief</p>
        <p className="mt-1.5 text-sm leading-relaxed text-white/70">
          AI pulls out the goals, scope, budget and timeline, flags risks, and lists what to ask {clientName} before you quote.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {out ? (
            <Link href="/credits" className="btn h-10 bg-lime px-4 text-forest hover:bg-white">Buy credits to summarise</Link>
          ) : (
            <button onClick={() => create()} disabled={busy} className="btn h-10 bg-lime px-4 text-forest hover:bg-white disabled:opacity-70">
              {busy ? <><span className="size-4 animate-spin rounded-full border-2 border-forest/30 border-t-forest" /> Writing the brief…</> : <><Sparkles className="size-4" /> Summarise with AI</>}
            </button>
          )}
          <span className="text-xs text-white/60">{SUMMARY_COST} credit · you have {credits}</span>
        </div>
        {error && <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm text-red-200 animate-error-in">{error}</p>}
      </div>
    );
  }

  const questions = summary.missing.map((q, i) => `${i + 1}. ${q}`).join("\n");
  const followUp = `Hi${clientName && clientName !== "Anonymous" ? ` ${clientName.split(" ")[0]}` : ""}, thanks for filling the form! A few quick questions before I send your quote:\n\n${questions}`;

  async function copy() {
    await navigator.clipboard.writeText(followUp);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-3xl border border-brand/30 bg-brand-50/40 p-5 sm:p-6 animate-rise" aria-label="AI brief">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-semibold text-brand-700"><Sparkles className="size-4" /> AI brief</p>
        <div className="flex flex-wrap gap-2">
          <a href={`/brief/${responseId}?print=1`} target="_blank" className="btn-ghost h-9 bg-white px-3 text-[13px]">
            <FileDown className="size-4" /> Download PDF
          </a>
          <button onClick={() => create(true)} disabled={busy || credits < SUMMARY_COST} className="btn-ghost h-9 bg-white px-3 text-[13px] disabled:opacity-50" title={`Write a new brief (${SUMMARY_COST} credit)`}>
            <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} /> {busy ? "Writing…" : "Redo"}
          </button>
        </div>
      </div>

      {summary.overview && <p className="mt-4 text-[15px] leading-relaxed">{summary.overview}</p>}

      {(summary.budget || summary.timeline) && (
        <dl className="mt-4 grid gap-2 sm:grid-cols-2">
          {summary.budget && <Fact label="Budget" value={summary.budget} />}
          {summary.timeline && <Fact label="Timeline" value={summary.timeline} />}
        </dl>
      )}

      <List title="Goals" items={summary.goals} />
      <List title="Scope" items={summary.scope} />
      <List title="Notes" items={summary.notes} />

      {summary.risks.length > 0 && (
        <div className="mt-5 rounded-2xl bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900"><AlertTriangle className="size-4" /> Watch out for</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900/90">
            {summary.risks.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </div>
      )}

      {summary.missing.length > 0 && (
        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-semibold"><HelpCircle className="size-4 text-brand-700" /> Ask before you quote</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {summary.missing.map((x) => <li key={x}>{x}</li>)}
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={copy} className="btn-ghost h-9 px-3 text-[13px]">
              {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy questions</>}
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent(followUp)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost h-9 px-3 text-[13px]">
              <MessageCircle className="size-4" /> Send on WhatsApp
            </a>
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-soft">Written by AI from the client&apos;s answers. Check it against the full response below.</p>
      {error && <p className="mt-3 text-sm text-red-600 animate-error-in">{error}</p>}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-5">
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
        {items.map((x) => (
          <li key={x} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-brand" /> {x}</li>
        ))}
      </ul>
    </div>
  );
}
