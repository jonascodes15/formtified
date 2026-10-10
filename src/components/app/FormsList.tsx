"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, FileText, MoreVertical, Link2, Copy, Trash2, Inbox, Pencil, Check } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { plural, timeAgo } from "@/lib/format";

interface Item {
  id: number;
  slug: string;
  title: string;
  status: string;
  updated_at: string;
  response_count: number;
}

type Sort = "recent" | "responses" | "az";
type Status = "all" | "published" | "closed";

export function FormsList({ forms }: { forms: Item[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<Sort>("recent");
  const [status, setStatus] = useState<Status>("all");
  const [menu, setMenu] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const shown = useMemo(() => {
    let list = forms.filter((f) => f.title.toLowerCase().includes(q.trim().toLowerCase()));
    if (status !== "all") list = list.filter((f) => f.status === status);
    if (sort === "responses") list = [...list].sort((a, b) => b.response_count - a.response_count);
    if (sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [forms, q, sort, status]);

  async function copyLink(f: Item) {
    await navigator.clipboard.writeText(`${window.location.origin}/f/${f.slug}`);
    setCopied(f.id);
    setMenu(null);
    setTimeout(() => setCopied(null), 1600);
  }

  async function duplicate(f: Item) {
    setBusy(true);
    setMenu(null);
    const res = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ copyOf: f.id }) });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  async function remove(f: Item) {
    setMenu(null);
    if (!confirm(`Delete "${f.title}" and all its responses? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/forms/${f.id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <section className="mt-8">
      <div className="flex gap-3">
        <label className="flex flex-1 items-center gap-3 rounded-full bg-white border border-line/60 px-5 h-16 shadow-[var(--shadow-card)] focus-within:border-brand">
          <Search className="size-6 text-muted" strokeWidth={1.7} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your forms..."
            className="w-full bg-transparent text-[17px] outline-none placeholder:text-muted"
          />
        </label>
        <button
          onClick={() => setShowFilters((v) => !v)}
          aria-label="Filter and sort"
          aria-expanded={showFilters}
          className={`grid size-16 place-items-center rounded-3xl border shadow-[var(--shadow-card)] transition ${
            showFilters || sort !== "recent" || status !== "all" ? "border-brand bg-brand-50" : "border-line/60 bg-white"
          }`}
        >
          <SlidersHorizontal className="size-6" strokeWidth={1.7} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showFilters && (
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            className="card mt-3 grid gap-4 p-5 sm:grid-cols-2"
          >
            <div>
              <p className="mb-2 text-sm font-medium text-muted">Status</p>
              <div className="flex flex-wrap gap-2">
                {(["all", "published", "closed"] as Status[]).map((s) => (
                  <button key={s} onClick={() => setStatus(s)} className={`chip capitalize ${status === s ? "border-brand bg-brand-50 text-brand-700" : ""}`}>
                    {s === "published" ? "Accepting responses" : s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-muted">Sort by</p>
              <div className="flex flex-wrap gap-2">
                {([
                  ["recent", "Recently updated"],
                  ["responses", "Most responses"],
                  ["az", "A to Z"],
                ] as [Sort, string][]).map(([s, l]) => (
                  <button key={s} onClick={() => setSort(s)} className={`chip ${sort === s ? "border-brand bg-brand-50 text-brand-700" : ""}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <h2 className="display mt-10 text-2xl font-semibold">Your forms</h2>

      {forms.length === 0 ? (
        <div className="card mt-5 flex flex-col items-center px-6 py-12 text-center">
          <span className="grid size-16 place-items-center rounded-3xl bg-brand-50">
            <FileText className="size-7 text-brand" />
          </span>
          <p className="mt-4 text-lg font-semibold">No forms yet</p>
          <p className="mt-1 max-w-sm text-muted">Describe a client project and Formtified AI will build the onboarding form for you.</p>
          <Link href="/generate" className="btn-primary mt-6">Generate your first form</Link>
        </div>
      ) : shown.length === 0 ? (
        <p className="mt-5 text-muted">No forms match your search.</p>
      ) : (
        <ul className={`relative mt-5 grid gap-4 md:grid-cols-2 ${busy ? "opacity-60" : ""}`}>
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((f, i) => (
              <m.li
                key={f.id}
                layout="position"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 12) * 0.045 } }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
                className={`card card-hover relative flex items-center gap-5 p-5 sm:p-6 hover:border-brand/40 ${menu === f.id ? "z-20" : ""}`}
              >
                <Link href={`/forms/${f.id}`} className="absolute inset-0 rounded-3xl" aria-label={`Open ${f.title}`} />
                <span className="grid size-[4.5rem] shrink-0 place-items-center rounded-3xl bg-brand-50">
                  <FileText className="size-8" strokeWidth={1.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[17px] font-semibold leading-snug">{f.title}</p>
                  <p className="mt-1 text-[15px] text-muted">
                    Updated {timeAgo(f.updated_at)} · {plural(f.response_count, "response")}
                    {f.status === "closed" && <span className="ml-2 rounded-full bg-canvas px-2 py-0.5 text-xs">Closed</span>}
                  </p>
                </div>
                <div className="relative z-10">
                  <button
                    onClick={() => setMenu(menu === f.id ? null : f.id)}
                    aria-label="Form actions"
                    className="grid size-10 place-items-center rounded-full hover:bg-canvas"
                  >
                    {copied === f.id ? <Check className="size-5 text-brand" /> : <MoreVertical className="size-5 text-muted" />}
                  </button>
                  <AnimatePresence>
                    {menu === f.id && (
                      <>
                        <button className="fixed inset-0 z-10 cursor-default" aria-hidden="true" tabIndex={-1} onClick={() => setMenu(null)} />
                        <m.div
                          initial={{ opacity: 0, scale: 0.92, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
                          style={{ transformOrigin: "top right" }}
                          className="absolute right-0 top-11 z-20 w-52 card p-1.5"
                        >
                          <MenuLink href={`/forms/${f.id}`} icon={Pencil} label="Edit form" />
                          <MenuLink href={`/responses?form=${f.id}`} icon={Inbox} label="View responses" />
                          <MenuButton onClick={() => copyLink(f)} icon={Link2} label="Copy share link" />
                          <MenuButton onClick={() => duplicate(f)} icon={Copy} label="Duplicate" />
                          <MenuButton onClick={() => remove(f)} icon={Trash2} label="Delete" danger />
                        </m.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}

type IconT = React.ComponentType<{ className?: string }>;
function MenuLink({ href, icon: Icon, label }: { href: string; icon: IconT; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-canvas">
      <Icon className="size-4 text-muted" /> {label}
    </Link>
  );
}
function MenuButton({ onClick, icon: Icon, label, danger }: { onClick: () => void; icon: IconT; label: string; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-canvas ${danger ? "text-red-600" : ""}`}>
      <Icon className={`size-4 ${danger ? "" : "text-muted"}`} /> {label}
    </button>
  );
}
