"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, FileText, Plus, X } from "lucide-react";
import type { Template } from "@/lib/templates";
import { FormRenderer } from "@/components/form/FormRenderer";
import { AnimatePresence, m } from "motion/react";

export function TemplatesGrid({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState<Template | null>(null);

  async function use(body: object, key: string) {
    setBusy(key);
    const res = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) router.push(`/forms/${data.id}`);
    else setBusy(null);
  }

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((t, i) => (
          <div key={t.key} className="card card-hover flex flex-col p-5 animate-rise" style={{ "--i": i } as React.CSSProperties}>
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-50"><FileText className="size-5" /></span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-700">{t.category}</p>
            <p className="mt-1 text-lg font-semibold">{t.name}</p>
            <p className="mt-1 flex-1 text-sm text-muted">{t.summary}</p>
            <p className="mt-3 text-xs text-soft">{t.fields.filter((f) => f.type !== "section").length} questions</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => use({ template: t.key }, t.key)} disabled={busy !== null} className="btn-primary h-10 flex-1">
                {busy === t.key ? "Creating…" : <>Use template <ArrowRight className="size-4" /></>}
              </button>
              <button onClick={() => setPreview(t)} className="btn-ghost h-10 px-3" aria-label={`Preview ${t.name}`}><Eye className="size-4" /></button>
            </div>
          </div>
        ))}
        <button onClick={() => use({ blank: true }, "blank")} disabled={busy !== null} className="card card-hover flex min-h-56 flex-col items-center justify-center border-dashed p-5 text-center hover:border-brand/50 animate-rise active:scale-[0.98]" style={{ "--i": templates.length } as React.CSSProperties}>
          <span className="grid size-12 place-items-center rounded-2xl bg-canvas"><Plus className="size-5" /></span>
          <p className="mt-3 font-semibold">{busy === "blank" ? "Creating…" : "Blank form"}</p>
          <p className="mt-1 text-sm text-muted">Build it question by question.</p>
        </button>
      </div>

      <AnimatePresence>
        {preview && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6"
            onClick={() => setPreview(null)}
          >
            <m.div
              initial={{ opacity: 0, y: 48, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.98, transition: { duration: 0.18 } }}
              className="max-h-[90dvh] w-full max-w-2xl overflow-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Preview</span>
                <button onClick={() => setPreview(null)} className="grid size-9 place-items-center rounded-full hover:bg-canvas" aria-label="Close"><X className="size-5" /></button>
              </div>
              <FormRenderer title={preview.title} description={preview.description} fields={preview.fields} preview />
              <button onClick={() => use({ template: preview.key }, preview.key)} disabled={busy !== null} className="btn-primary sticky bottom-0 mt-4 w-full">
                {busy ? "Creating…" : "Use this template"}
              </button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
