"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, FileText, Loader2, Plus, X } from "lucide-react";
import { TEMPLATE_CATEGORIES as CATEGORIES, type FormField } from "@/lib/types";
import { FormRenderer } from "@/components/form/FormRenderer";
import { AnimatePresence, m } from "motion/react";

export interface PickerTemplate {
  key: string;
  name: string;
  category: string;
  summary: string;
  title: string;
  description: string;
  fields: FormField[];
}

export function TemplatesGrid({ templates, autoUse }: { templates: PickerTemplate[]; autoUse?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(autoUse ?? null);
  const [preview, setPreview] = useState<PickerTemplate | null>(null);
  const [category, setCategory] = useState<string>("All");
  const started = useRef(false);

  async function use(body: object, key: string) {
    setBusy(key);
    const res = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) router.push(`/forms/${data.id}`);
    else setBusy(null);
  }

  // Arriving from a public template page's "Use this template" button: create it once, then open the editor.
  useEffect(() => {
    if (!autoUse || started.current) return;
    started.current = true;
    use({ template: autoUse }, autoUse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoUse]);

  if (autoUse && busy === autoUse) {
    const t = templates.find((x) => x.key === autoUse);
    return (
      <div className="mt-16 flex flex-col items-center text-center" role="status">
        <Loader2 className="size-8 animate-spin text-brand" />
        <p className="mt-4 font-semibold">Creating “{t?.name ?? "your form"}”…</p>
        <p className="mt-1 text-sm text-muted">You can edit every question before you share it.</p>
      </div>
    );
  }

  const shown = category === "All" ? templates : templates.filter((t) => t.category === category);

  return (
    <>
      <div className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Template categories">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={`h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition ${category === c ? "border-forest bg-forest text-white" : "border-line bg-white text-muted hover:text-ink"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((t, i) => (
          <div key={t.key} className="card card-hover flex flex-col p-5 animate-rise" style={{ "--i": Math.min(i, 8) } as React.CSSProperties}>
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
        <button onClick={() => use({ blank: true }, "blank")} disabled={busy !== null} className="card card-hover flex min-h-56 flex-col items-center justify-center border-dashed p-5 text-center hover:border-brand/50 animate-rise active:scale-[0.98]" style={{ "--i": Math.min(shown.length, 8) } as React.CSSProperties}>
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
