"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { FormField } from "@/lib/types";

type Value = string | string[];

export function FormRenderer({
  title,
  description,
  fields,
  slug,
  preview,
  ownerName,
  titleAs: Title = "h1",
}: {
  title: string;
  description?: string | null;
  fields: FormField[];
  slug?: string;
  preview?: boolean;
  ownerName?: string;
  /** "h2" when the form is shown inside another page that already has its own main heading. */
  titleAs?: "h1" | "h2";
}) {
  const [values, setValues] = useState<Record<string, Value>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const set = (id: string, v: Value) => {
    setValues((s) => ({ ...s, [id]: v }));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: "" }));
  };

  function validate() {
    const next: Record<string, string> = {};
    for (const f of fields) {
      if (f.type === "section") continue;
      const v = values[f.id];
      const empty = Array.isArray(v) ? v.length === 0 : !String(v ?? "").trim();
      if (f.required && empty) next[f.id] = "This question is required.";
      else if (!empty && f.type === "email" && !/^\S+@\S+\.\S+$/.test(String(v))) next[f.id] = "Enter a valid email address.";
    }
    setErrors(next);
    // Each unanswered required question gives a small shake (skipped for people who prefer reduced motion).
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const id of Object.keys(next)) {
        document.getElementById(`q-${id}`)?.animate(
          [{ translate: "0 0" }, { translate: "-6px 0" }, { translate: "5px 0" }, { translate: "-3px 0" }, { translate: "2px 0" }, { translate: "0 0" }],
          { duration: 420, easing: "ease-out" },
        );
      }
    }
    const first = Object.keys(next).find((k) => next[k]);
    if (first) document.getElementById(`q-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return !first;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate() || preview || !slug) return;
    setSubmitting(true);
    const res = await fetch(`/api/public/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: values, website: honeypot }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setServerError(data.error || "Could not submit. Please try again.");
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <div className="py-10 text-center">
        {/* The circle and tick draw themselves in */}
        <svg viewBox="0 0 64 64" className="mx-auto size-20 animate-pop" aria-hidden="true">
          <circle cx="32" cy="32" r="30" className="fill-brand-50" />
          <circle
            cx="32" cy="32" r="30" fill="none" stroke="var(--color-brand)" strokeWidth="3"
            pathLength={1} strokeDasharray="1" className="animate-draw" style={{ rotate: "-90deg", transformOrigin: "center" }}
          />
          <path
            d="M20 33l8 8 16-17" fill="none" stroke="var(--color-brand)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
            pathLength={1} strokeDasharray="1" className="animate-draw" style={{ animationDelay: "0.5s" }}
          />
        </svg>
        <h2 className="display mt-4 text-3xl font-semibold animate-rise" style={{ "--i": 8 } as React.CSSProperties}>Thank you!</h2>
        <p className="mx-auto mt-2 max-w-sm text-muted animate-rise" style={{ "--i": 10 } as React.CSSProperties}>
          Your answers have been sent{ownerName ? ` to ${ownerName}` : ""}. They will be in touch soon.
        </p>
      </div>
    );
  }

  const questionNumbers = new Map<string, number>();
  let n = 0;
  for (const f of fields) if (f.type !== "section") questionNumbers.set(f.id, ++n);

  // How much of the form is filled in, for the progress bar.
  const answered = fields.filter((f) => {
    if (f.type === "section") return false;
    const v = values[f.id];
    return Array.isArray(v) ? v.length > 0 : Boolean(String(v ?? "").trim());
  }).length;
  const progress = n ? answered / n : 0;

  return (
    <form onSubmit={submit} noValidate>
      <Title className="display text-3xl sm:text-4xl font-semibold leading-tight">{title}</Title>
      {description && <p className="mt-3 text-[16px] leading-relaxed text-muted whitespace-pre-wrap">{description}</p>}
      <p className="mt-3 text-sm text-soft"><span className="text-red-500">*</span> Required</p>

      {n > 1 && (
        <div
          className="sticky top-3 z-10 mt-6 rounded-2xl border border-line bg-white/90 px-4 py-3 shadow-[var(--shadow-card)] backdrop-blur"
          role="progressbar"
          aria-label="Questions answered"
          aria-valuemin={0}
          aria-valuemax={n}
          aria-valuenow={answered}
        >
          <div className="flex items-center justify-between gap-3 text-xs font-medium">
            <span className={answered === n ? "flex items-center gap-1.5 text-brand-700" : "text-muted"}>
              {answered === n ? <><Check className="size-3.5 animate-pop" strokeWidth={3} /> All questions answered</> : `${answered} of ${n} answered`}
            </span>
            <span className="tabular-nums text-soft">{Math.round(progress * 100)}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-50">
            <div
              className="h-full origin-left rounded-full bg-brand transition-transform duration-500 ease-spring"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
        </div>
      )}

      <div className="mt-8 space-y-7">
        {fields.map((f) =>
          f.type === "section" ? (
            <div key={f.id} className="pt-4">
              <h2 className="display text-xl font-semibold text-brand-700">{f.label}</h2>
              {f.help && <p className="mt-1 text-sm text-muted">{f.help}</p>}
              <div className="mt-3 h-px bg-line" />
            </div>
          ) : (
            <div key={f.id} id={`q-${f.id}`}>
              <label htmlFor={f.id} className="block text-[16px] font-semibold leading-snug">
                <span className="text-soft font-medium mr-1">{questionNumbers.get(f.id)}.</span> {f.label}
                {f.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              {f.help && <p className="mt-1 text-sm text-muted">{f.help}</p>}
              <div className="mt-3">
                <Input field={f} value={values[f.id]} onChange={(v) => set(f.id, v)} invalid={Boolean(errors[f.id])} />
              </div>
              {errors[f.id] && <p className="mt-1.5 text-sm text-red-600 animate-error-in">{errors[f.id]}</p>}
            </div>
          ),
        )}
      </div>

      {/* Hidden from people; bots fill it. */}
      <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {serverError && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 animate-error-in">{serverError}</p>}
      <button type="submit" disabled={submitting || preview} className="btn-primary mt-10 h-13 w-full text-base sm:w-auto sm:px-10">
        {preview ? "Submit (disabled in preview)" : submitting ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}

function Input({ field, value, onChange, invalid }: { field: FormField; value: Value | undefined; onChange: (v: Value) => void; invalid: boolean }) {
  const cls = `input ${invalid ? "border-red-400" : ""}`;
  const str = typeof value === "string" ? value : "";
  switch (field.type) {
    case "long_text":
      return <textarea id={field.id} className={`textarea ${invalid ? "border-red-400" : ""}`} rows={5} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />;
    case "email":
      return <input id={field.id} type="email" autoComplete="email" className={cls} value={str} placeholder={field.placeholder ?? "name@example.com"} onChange={(e) => onChange(e.target.value)} />;
    case "phone":
      return <input id={field.id} type="tel" autoComplete="tel" className={cls} value={str} placeholder={field.placeholder ?? "+234..."} onChange={(e) => onChange(e.target.value)} />;
    case "url":
      return <input id={field.id} type="url" className={cls} value={str} placeholder={field.placeholder ?? "https://"} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return <input id={field.id} type="number" inputMode="decimal" className={cls} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />;
    case "date":
      return <input id={field.id} type="date" className={cls} value={str} onChange={(e) => onChange(e.target.value)} />;
    case "dropdown":
      return (
        <select id={field.id} className={`${cls} cursor-pointer`} value={str} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select an option</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case "single_choice":
      return (
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
          {field.options?.map((o) => {
            const on = str === o;
            return (
              <button type="button" role="radio" aria-checked={on} key={o} onClick={() => onChange(on ? "" : o)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] transition ease-spring active:scale-[0.98] ${on ? "border-brand bg-brand-50" : "border-line bg-white hover:border-brand/50"}`}>
                <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-brand" : "border-line"}`}>
                  {on && <span className="size-2.5 rounded-full bg-brand animate-pop" />}
                </span>
                {o}
              </button>
            );
          })}
        </div>
      );
    case "multi_choice": {
      const arr = Array.isArray(value) ? value : [];
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {field.options?.map((o) => {
            const on = arr.includes(o);
            return (
              <button type="button" role="checkbox" aria-checked={on} key={o} onClick={() => onChange(on ? arr.filter((x) => x !== o) : [...arr, o])}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] transition ease-spring active:scale-[0.98] ${on ? "border-brand bg-brand-50" : "border-line bg-white hover:border-brand/50"}`}>
                <span className={`grid size-5 shrink-0 place-items-center rounded-md border-2 ${on ? "border-brand bg-brand text-white" : "border-line"}`}>
                  {on && <Check className="size-3.5 animate-pop" strokeWidth={3} />}
                </span>
                {o}
              </button>
            );
          })}
        </div>
      );
    }
    default:
      return <input id={field.id} type="text" className={cls} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
}
