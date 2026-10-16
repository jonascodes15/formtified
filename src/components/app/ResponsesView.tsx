"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Inbox, Mail, Paperclip, Trash2, Search } from "lucide-react";
import type { Answers, BriefSummary, FormField } from "@/lib/types";
import { formatBytes, initials, timeAgo } from "@/lib/format";
import { PREVIEWABLE_IMAGES } from "@/lib/files";
import { BriefPanel } from "./BriefPanel";

interface FormLite {
  id: number;
  title: string;
  fields: FormField[];
  count: number;
}
interface FileLite {
  id: number;
  field_id: string;
  name: string;
  size: number;
  content_type: string;
}
interface Resp {
  id: number;
  form_id: number;
  answers: Answers;
  name: string | null;
  email: string | null;
  is_read: boolean;
  created_at: string;
  summary: BriefSummary | null;
  files: FileLite[];
}

export function ResponsesView({
  forms,
  selectedForm,
  responses: initial,
  initialOpen,
  credits: initialCredits,
}: {
  forms: FormLite[];
  selectedForm: number | null;
  responses: Resp[];
  initialOpen: number | null;
  credits: number;
}) {
  const router = useRouter();
  const [responses, setResponses] = useState(() =>
    initial.map((r) => (r.id === initialOpen ? { ...r, is_read: true } : r)),
  );
  const [credits, setCredits] = useState(initialCredits);
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
          {shown.map((r, i) => (
            <li key={r.id} className="animate-rise" style={{ "--i": i } as React.CSSProperties}>
              <button
                onClick={() => openResponse(r)}
                className={`card flex w-full items-center gap-3 rounded-2xl p-4 text-left transition ease-spring active:scale-[0.99] ${openId === r.id ? "border-brand bg-brand-50/50" : "hover:border-brand/40"}`}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-medium">{initials(r.name || r.email || "?")}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`truncate ${r.is_read ? "font-medium" : "font-semibold"}`}>{r.name || r.email || "Anonymous"}</span>
                    {!r.is_read && <span className="size-2 shrink-0 rounded-full bg-brand animate-pop" aria-label="New" />}
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
            <ResponseDetail
              response={open}
              form={formMap.get(open.form_id)}
              credits={credits}
              onSummary={(summary, left) => {
                setResponses((rs) => rs.map((x) => (x.id === open.id ? { ...x, summary } : x)));
                setCredits(left);
              }}
              onBack={() => setOpenId(null)}
              onDelete={() => remove(open.id)}
            />
          ) : (
            <div className="card grid h-full min-h-64 place-items-center p-8 text-center text-muted">Select a response to read it.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResponseDetail({
  response,
  form,
  credits,
  onSummary,
  onBack,
  onDelete,
}: {
  response: Resp;
  form?: FormLite;
  credits: number;
  onSummary: (s: BriefSummary, credits: number) => void;
  onBack: () => void;
  onDelete: () => void;
}) {
  const fields = form?.fields ?? [];
  const known = new Set(fields.map((f) => f.id));
  const orphan = Object.entries(response.answers).filter(([k]) => !known.has(k));
  const who = response.name || response.email || "Anonymous";

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

      <div className="mt-6">
        <BriefPanel key={response.id} responseId={response.id} summary={response.summary} credits={credits} clientName={who} onSummary={onSummary} />
      </div>

      <dl className="mt-6 space-y-5">
        {fields.map((f) => {
          if (f.type === "section") return <h3 key={f.id} className="display pt-3 text-lg font-semibold text-brand-700">{f.label}</h3>;
          if (f.type === "file") {
            const attached = response.files.filter((x) => x.field_id === f.id);
            return (
              <div key={f.id}>
                <dt className="text-sm font-medium text-muted">{f.label}</dt>
                <dd className="mt-2">
                  {attached.length ? <Attachments files={attached} /> : <span className="text-[15px] italic text-soft">No files</span>}
                </dd>
              </div>
            );
          }
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

/** A client's attached files: photos show as thumbnails, everything else as a download row. */
function Attachments({ files }: { files: FileLite[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {files.map((f) => {
        const isImage = PREVIEWABLE_IMAGES.includes(f.content_type);
        return (
          <li key={f.id} className="flex items-center gap-3 rounded-2xl border border-line p-2 pr-3">
            {isImage ? (
              <a href={`/api/files/${f.id}`} target="_blank" className="shrink-0" aria-label={`Open ${f.name}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- private file served by our own API, not optimisable */}
                <img src={`/api/files/${f.id}`} alt="" loading="lazy" className="size-12 rounded-xl bg-canvas object-cover" />
              </a>
            ) : (
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Paperclip className="size-5" /></span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{f.name}</span>
              <span className="text-xs text-soft">{formatBytes(f.size)}</span>
            </span>
            <a href={`/api/files/${f.id}?download=1`} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-canvas" aria-label={`Download ${f.name}`} title="Download">
              <Download className="size-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
