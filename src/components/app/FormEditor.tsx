"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown, ArrowUp, Check, Copy, CopyPlus, ExternalLink, Eye, Inbox, MessageCircle, Plus, Trash2, X, Heading,
} from "lucide-react";
import { CHOICE_TYPES, FIELD_LABELS, FIELD_TYPES, type FieldType, type FormField } from "@/lib/types";
import { FormRenderer } from "@/components/form/FormRenderer";
import { useOrigin } from "@/lib/useOrigin";
import { UPLOAD_MAX_FILES, UPLOAD_MAX_MB } from "@/lib/files";
import { AnimatePresence, m } from "motion/react";

interface EditorForm {
  id: number;
  slug: string;
  title: string;
  description: string;
  fields: FormField[];
  status: "published" | "closed";
  responseCount: number;
  brief: string | null;
}

const newId = () => "f_" + Math.random().toString(16).slice(2, 10);

export function FormEditor({ form, uploads }: { form: EditorForm; uploads: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description);
  const [fields, setFields] = useState<FormField[]>(form.fields);
  const [status, setStatus] = useState(form.status);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(false);
  const origin = useOrigin();

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const link = `${origin}/f/${form.slug}`;
  const touch = () => {
    setDirty(true);
    setSaved(false);
  };

  function update(i: number, patch: Partial<FormField>) {
    setFields((fs) =>
      fs.map((f, j) => {
        if (j !== i) return f;
        const next = { ...f, ...patch };
        if (patch.type) {
          if (CHOICE_TYPES.includes(patch.type) && !next.options?.length) next.options = ["Option 1", "Option 2"];
          if (!CHOICE_TYPES.includes(patch.type)) delete next.options;
          if (patch.type === "section") delete next.required;
        }
        return next;
      }),
    );
    touch();
  }
  function move(i: number, dir: -1 | 1) {
    setFields((fs) => {
      const j = i + dir;
      if (j < 0 || j >= fs.length) return fs;
      const copy = [...fs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
    touch();
  }
  function remove(i: number) {
    setFields((fs) => fs.filter((_, j) => j !== i));
    touch();
  }
  function duplicate(i: number) {
    setFields((fs) => [...fs.slice(0, i + 1), { ...fs[i], id: newId() }, ...fs.slice(i + 1)]);
    touch();
  }
  function add(type: FieldType) {
    const f: FormField =
      type === "section"
        ? { id: newId(), type, label: "New section" }
        : { id: newId(), type, label: "", required: false, ...(CHOICE_TYPES.includes(type) ? { options: ["Option 1", "Option 2"] } : {}) };
    setFields((fs) => [...fs, f]);
    touch();
    setTimeout(() => document.getElementById(`field-${f.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  async function save(nextStatus?: "published" | "closed") {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/forms/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        fields: fields.map((f) => ({ ...f, label: f.label.trim() || "Untitled question" })),
        status: nextStatus ?? status,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not save.");
      return;
    }
    if (nextStatus) setStatus(nextStatus);
    setFields(data.fields);
    setDirty(false);
    setSaved(true);
    router.refresh();
  }

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_20rem]">
      <div className="min-w-0 space-y-4 order-2 xl:order-1">
        <div className="flex items-center gap-2 rounded-full bg-white border border-line p-1 w-fit">
          <button onClick={() => setPreview(false)} className={`relative isolate rounded-full px-4 h-9 text-sm font-medium transition-colors ${!preview ? "text-brand-700" : "text-muted"}`}>
            {!preview && <m.span layoutId="editor-tab" className="absolute inset-0 -z-10 rounded-full bg-brand-50" />}
            Questions
          </button>
          <button onClick={() => setPreview(true)} className={`relative isolate inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-sm font-medium transition-colors ${preview ? "text-brand-700" : "text-muted"}`}>
            {preview && <m.span layoutId="editor-tab" className="absolute inset-0 -z-10 rounded-full bg-brand-50" />}
            <Eye className="size-4" /> Preview
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {preview ? (
            <m.div key="preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }} className="card p-5 sm:p-8">
              <FormRenderer title={title} description={description} fields={fields} preview uploads={uploads} />
            </m.div>
          ) : (
            <m.div key="questions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }} className="relative space-y-4">
              <div className="card p-5 sm:p-6 border-t-4 border-t-brand">
                <input
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); touch(); }}
                  className="display w-full bg-transparent text-2xl sm:text-3xl font-semibold outline-none"
                  placeholder="Form title"
                  aria-label="Form title"
                />
                <textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); touch(); }}
                  rows={2}
                  className="mt-2 w-full resize-none bg-transparent text-muted outline-none"
                  placeholder="A short note for your client (optional)"
                  aria-label="Form description"
                />
              </div>

              {/* Each question glides to its new place when moved, and slides in or out when added or deleted. */}
              <AnimatePresence initial={false} mode="popLayout">
                {fields.map((f, i) => (
                  <m.div
                    key={f.id}
                    layout="position"
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
                  >
                    <FieldCard
                      field={f}
                      uploads={uploads}
                      index={i}
                      total={fields.length}
                      onChange={(p) => update(i, p)}
                      onMove={(d) => move(i, d)}
                      onRemove={() => remove(i)}
                      onDuplicate={() => duplicate(i)}
                    />
                  </m.div>
                ))}
              </AnimatePresence>

              <m.div layout="position">
                <AddField onAdd={add} />
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Share + save panel */}
      <aside className="order-1 xl:order-2">
        <div className="card p-5 xl:sticky xl:top-8 space-y-4">
          <div>
            <p className="text-sm font-medium text-muted">Share link</p>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-line bg-canvas p-1.5 pl-3">
              <span className="min-w-0 flex-1 truncate text-sm">{link.replace(/^https?:\/\//, "")}</span>
              <button onClick={copy} className="grid size-9 place-items-center rounded-xl bg-brand text-white hover:bg-brand-600" aria-label="Copy link">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a href={`/f/${form.slug}`} target="_blank" className="btn-ghost h-10 px-3 text-[13px]"><ExternalLink className="size-4" /> Open</a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Hi! Please fill this form so I understand everything you want for your project: ${link}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost h-10 px-3 text-[13px]"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-2xl bg-canvas px-4 py-3">
            <span>
              <span className="block text-sm font-semibold">Accepting responses</span>
              <span className="text-xs text-muted">{status === "published" ? "Clients can fill this form" : "Form is closed"}</span>
            </span>
            <Toggle on={status === "published"} onChange={(on) => save(on ? "published" : "closed")} />
          </label>

          <Link href={`/responses?form=${form.id}`} className="flex items-center justify-between rounded-2xl bg-canvas px-4 py-3 hover:bg-brand-50">
            <span className="flex items-center gap-2 text-sm font-semibold"><Inbox className="size-4" /> Responses</span>
            <span className="text-sm text-muted">{form.responseCount}</span>
          </Link>

          <button onClick={() => save()} disabled={saving || !dirty} className="btn-primary w-full">
            {saving ? "Saving…" : saved && !dirty ? <><Check className="size-4 animate-pop" /> Saved</> : dirty ? "Save changes" : "All changes saved"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}

          {form.brief && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted">Your original description</summary>
              <p className="mt-2 whitespace-pre-wrap text-muted">{form.brief}</p>
            </details>
          )}
        </div>
      </aside>

      {/* Sticky save bar on mobile when there are unsaved changes */}
      <AnimatePresence>
        {dirty && (
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24, transition: { duration: 0.15 } }}
            className="xl:hidden fixed inset-x-0 bottom-24 z-30 px-4"
          >
            <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-forest py-2 pl-5 pr-2 text-white shadow-[var(--shadow-float)]">
              <span className="text-sm">Unsaved changes</span>
              <button onClick={() => save()} disabled={saving} className="btn h-10 bg-lime text-forest hover:bg-white">{saving ? "Saving…" : "Save"}</button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-brand" : "bg-line"}`}
    >
      <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all duration-300 ease-spring ${on ? "left-6" : "left-1"}`} />
    </button>
  );
}

function FieldCard({
  field, uploads, index, total, onChange, onMove, onRemove, onDuplicate,
}: {
  field: FormField;
  uploads: boolean;
  index: number;
  total: number;
  onChange: (p: Partial<FormField>) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const isSection = field.type === "section";
  const isChoice = CHOICE_TYPES.includes(field.type);

  return (
    <div id={`field-${field.id}`} className={`card p-4 sm:p-5 ${isSection ? "bg-brand-50/60 border-brand/20" : ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder={isSection ? "Section title" : "Question"}
          className={`input flex-1 ${isSection ? "display text-lg font-semibold" : "font-medium"}`}
          aria-label="Question label"
        />
        <select
          value={field.type}
          onChange={(e) => onChange({ type: e.target.value as FieldType })}
          className="input sm:w-56 cursor-pointer"
          aria-label="Question type"
        >
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>{FIELD_LABELS[t]}</option>
          ))}
        </select>
      </div>

      <input
        value={field.help ?? ""}
        onChange={(e) => onChange({ help: e.target.value })}
        placeholder={isSection ? "Section description (optional)" : "Hint for the client (optional)"}
        className="mt-2 w-full bg-transparent px-1 py-1 text-sm text-muted outline-none"
        aria-label="Hint"
      />

      {field.type === "file" && (
        <p className={`mt-2 rounded-xl px-3 py-2 text-xs ${uploads ? "bg-canvas text-muted" : "bg-amber-50 text-amber-900"}`}>
          {uploads
            ? `Clients can attach up to ${UPLOAD_MAX_FILES} files, ${UPLOAD_MAX_MB} MB each: images, PDFs, documents, audio and video. Only you can open them.`
            : "File uploads aren't switched on for this site yet, so clients will see this question but can't attach files. It won't stop them submitting."}
        </p>
      )}

      {isChoice && (
        <div className="mt-3 space-y-2">
          {(field.options ?? []).map((o, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <span className={`size-4 shrink-0 border-2 border-line ${field.type === "multi_choice" ? "rounded" : "rounded-full"}`} />
              <input
                value={o}
                onChange={(e) => onChange({ options: field.options!.map((x, k) => (k === oi ? e.target.value : x)) })}
                className="flex-1 rounded-xl border border-transparent px-2 h-9 text-sm outline-none hover:border-line focus:border-brand"
                aria-label={`Option ${oi + 1}`}
              />
              <button
                onClick={() => onChange({ options: field.options!.filter((_, k) => k !== oi) })}
                disabled={(field.options?.length ?? 0) <= 1}
                className="grid size-8 place-items-center rounded-full text-soft hover:bg-canvas hover:text-ink disabled:opacity-30"
                aria-label="Remove option"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ options: [...(field.options ?? []), `Option ${(field.options?.length ?? 0) + 1}`] })}
            className="ml-6 text-sm font-medium text-brand-700 hover:underline"
          >
            + Add option
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        {!isSection ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(field.required)} onChange={(e) => onChange({ required: e.target.checked })} className="size-4 accent-[var(--color-brand)]" />
            Required
          </label>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium text-brand-700"><Heading className="size-3.5" /> Section</span>
        )}
        <div className="flex items-center gap-1">
          <IconBtn label="Move up" onClick={() => onMove(-1)} disabled={index === 0}><ArrowUp className="size-4" /></IconBtn>
          <IconBtn label="Move down" onClick={() => onMove(1)} disabled={index === total - 1}><ArrowDown className="size-4" /></IconBtn>
          <IconBtn label="Duplicate" onClick={onDuplicate}><CopyPlus className="size-4" /></IconBtn>
          <IconBtn label="Delete" onClick={onRemove} danger><Trash2 className="size-4" /></IconBtn>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid size-9 place-items-center rounded-full text-muted hover:bg-canvas disabled:opacity-30 ${danger ? "hover:text-red-600" : "hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

function AddField({ onAdd }: { onAdd: (t: FieldType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card border-dashed p-4">
      {!open ? (
        <button onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-2 py-2 font-semibold text-brand-700">
          <Plus className="size-5" /> Add question
        </button>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Choose a question type</p>
            <button onClick={() => setOpen(false)} aria-label="Close" className="grid size-8 place-items-center rounded-full hover:bg-canvas"><X className="size-4" /></button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {FIELD_TYPES.map((t) => (
              <button key={t} onClick={() => { onAdd(t); setOpen(false); }} className="chip">{FIELD_LABELS[t]}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
