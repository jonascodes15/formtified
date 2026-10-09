"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Inbox, Mail, Trash2, Search } from "lucide-react";
import type { Answers, FormField } from "@/lib/types";
import { initials, timeAgo } from "@/lib/format";

interface FormLite {
  id: number;
  title: string;
  fields: FormField[];
  count: number;
}
interface Resp {
  id: number;
  form_id: number;
  answers: Answers;
  name: string | null;
  email: string | null;
  is_read: boolean;
  created_at: string;
}

export function ResponsesView({
  forms,
  selectedForm,
  responses: initial,
  initialOpen,
}: {
  forms: FormLite[];
  selectedForm: number | null;
  responses: Resp[];
  initialOpen: number | null;
}) {
  const router = useRouter();
  const [responses, setResponses] = useState(() =>
    initial.map((r) => (r.id === initialOpen ? { ...r, is_read: true } : r)),
  );
  const [openId, setOpenId] = useState<number | null>(initialOpen);
  const [q, setQ] = useState("");

  // A response opened straight from a notification link counts as read.
  useEffect(() => {
    if (initialOpen && initial.some((r) => r.id === initialOpen && !r.is_read)) {
      fetch(`/api/responses/${initialOpen}`, { method: "PATCH" }).catch(() => {});
    }
  }, [initialOpen, initial]);

  const formMap = useMemo(() => new Map(forms.map((f) => [f.id, f])), [forms]);
  const open = responses.find((r) => r.id === openId) ?? null;

  const shown = responses.filter((r) => {
    if (!q.trim()) return true;
    const hay = [r.name, r.email, formMap.get(r.form_id)?.title, ...Object.values(r.answers).flat()].join(" ").toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  function openResponse(r: Resp) {
    setOpenId(r.id);
    if (!r.is_read) {
      setResponses((rs) => rs.map((x) => (x.id === r.id ? { ...x, is_read: true } : x)));
      fetch(`/api/responses/${r.id}`, { method: "PATCH" }).then(() => router.refresh());
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this response? This cannot be undone.")) return;
    await fetch(`/api/responses/${id}`, { method: "DELETE" });
    setResponses((rs) => rs.filter((r) => r.id !== id));
    setOpenId(null);
    router.refresh();
  }

  function pickForm(id: string) {
    router.push(id ? `/responses?form=${id}` : "/responses");
    setOpenId(null);
  }

  if (forms.length === 0) {
    return (
      <div className="card mt-8 flex flex-col items-center px-6 py-14 text-center">
        <Inbox className="size-10 text-brand" />
        <p className="mt-4 text-lg font-semibold">No responses yet</p>
        <p className="mt-1 text-muted">Create a form and share its link. Your clients&apos; answers will show up here.</p>
        <Link href="/generate" className="btn-primary mt-6">Generate a form</Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row">
        <select value={selectedForm ?? ""} onChange={(e) => pickForm(e.target.value)} className="input sm:max-w-xs cursor-pointer" aria-label="Filter by form">
          <option value="">All forms</option>
          {forms.map((f) => (
            <option key={f.id} value={f.id}>{f.title} ({f.count})</option>
          ))}
        </select>
        <label className="input flex flex-1 items-center gap-2">
          <Search className="size-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search answers, names, emails" className="w-full bg-transparent outline-none" />
        </label>
        {selectedForm && (
          <a href={`/api/forms/${selectedForm}/export`} className="btn-dark h-12">
            <Download className="size-4" /> Export CSV
          </a>
        )}
      </div>
      {!selectedForm && <p className="mt-2 text-xs text-soft">Pick a form to export its responses as CSV (opens in Excel or Google Sheets).</p>}

      <div className="mt-6 grid gap-5 lg:grid-cols-[22rem_1fr]">
        <ul className={`space-y-2 ${open ? "hidden lg:block" : ""}`}>
          {shown.length === 0 && <li className="card p-6 text-center text-muted">No responses {q ? "match your search" : "yet"}.</li>}
          {shown.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => openResponse(r)}
                className={`card flex w-full items-center gap-3 rounded-2xl p-4 text-left transition ${openId === r.id ? "border-brand bg-brand-50/50" : "hover:border-brand/40"}`}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-medium">{initials(r.name || r.email || "?")}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`truncate ${r.is_read ? "font-medium" : "font-semibold"}`}>{r.name || r.email || "Anonymous"}</span>
                    {!r.is_read && <span className="size-2 shrink-0 rounded-full bg-brand" aria-label="New" />}
                  </span>
                  <span className="block truncate text-sm text-muted">{formMap.get(r.form_id)?.title}</span>
                </span>
                <span className="shrink-0 text-xs text-soft">{timeAgo(r.created_at)}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className={open ? "" : "hidden lg:block"}>
          {open ? (
            <ResponseDetail response={open} form={formMap.get(open.form_id)} onBack={() => setOpenId(null)} onDelete={() => remove(open.id)} />
          ) : (
            <div className="card grid h-full min-h-64 place-items-center p-8 text-center text-muted">Select a response to read it.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResponseDetail({ response, form, onBack, onDelete }: { response: Resp; form?: FormLite; onBack: () => void; onDelete: () => void }) {
  const fields = form?.fields ?? [];
  const known = new Set(fields.map((f) => f.id));
  const orphan = Object.entries(response.answers).filter(([k]) => !known.has(k));

  return (
    <article className="card p-5 sm:p-8 animate-rise">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="lg:hidden grid size-10 shrink-0 place-items-center rounded-full border border-line" aria-label="Back to list">
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0">
            <p className="display truncate text-xl font-semibold">{response.name || response.email || "Anonymous"}</p>
            <p className="text-sm text-muted">{form?.title} · {new Date(response.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          {response.email && (
            <a href={`mailto:${response.email}?subject=${encodeURIComponent(`Re: ${form?.title ?? "your project"}`)}`} className="grid size-10 place-items-center rounded-full hover:bg-canvas" aria-label="Reply by email" title="Reply by email">
              <Mail className="size-4" />
            </a>
          )}
          <button onClick={onDelete} className="grid size-10 place-items-center rounded-full text-muted hover:bg-canvas hover:text-red-600" aria-label="Delete response" title="Delete">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <dl className="mt-6 space-y-5">
        {fields.map((f) => {
          if (f.type === "section") return <h3 key={f.id} className="display pt-3 text-lg font-semibold text-brand-700">{f.label}</h3>;
          const v = response.answers[f.id];
          const text = Array.isArray(v) ? v.join(", ") : v;
          return (
            <div key={f.id}>
              <dt className="text-sm font-medium text-muted">{f.label}</dt>
              <dd className={`mt-1 whitespace-pre-wrap text-[15px] leading-relaxed ${text ? "" : "text-soft italic"}`}>
                {f.type === "url" && text && /^https?:\/\//i.test(text) ?<a href={text} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-700 underline break-all">{text}</a> : text || "No answer"}
              </dd>
            </div>
          );
        })}
        {orphan.length > 0 && (
          <div className="border-t border-line pt-4">
            <p className="text-xs text-soft">Answers to questions that were later removed from the form:</p>
            {orphan.map(([k, v]) => (
              <p key={k} className="mt-2 text-[15px]">{Array.isArray(v) ? v.join(", ") : v}</p>
            ))}
          </div>
        )}
      </dl>
    </article>
  );
}
