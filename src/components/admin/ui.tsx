import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { compact } from "@/lib/format";

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="display text-2xl sm:text-3xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

/** A headline number. `change` is a % vs the previous period; up is shown as good. */
export function StatTile({ label, value, change, hint }: { label: string; value: number | string; change?: number | null; hint?: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-xs sm:text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl sm:text-3xl font-semibold">{typeof value === "number" ? compact(value) : value}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs">
        {change != null && (
          <span className={`inline-flex items-center gap-0.5 font-medium ${change >= 0 ? "text-brand-700" : "text-red-600"}`}>
            {change >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
        {hint && <span className="text-soft">{hint}</span>}
      </div>
    </div>
  );
}

export function Card({ title, subtitle, action, children, className = "" }: { title?: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Ranked list with a thin bar under each label (top pages, sources, countries...). */
export function BarList({
  items,
  empty = "No data yet.",
  valueLabel = "views",
}: {
  items: { label: React.ReactNode; value: number; key: string; href?: string }[];
  empty?: string;
  valueLabel?: string;
}) {
  if (items.length === 0) return <p className="py-6 text-center text-sm text-muted">{empty}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            {i.href ? (
              <Link href={i.href} className="min-w-0 truncate hover:underline">{i.label}</Link>
            ) : (
              <span className="min-w-0 truncate">{i.label}</span>
            )}
            <span className="shrink-0 tabular-nums text-muted" title={`${i.value} ${valueLabel}`}>{compact(i.value)}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full">
            <div className="h-full rounded-r-[4px] bg-brand" style={{ width: `${Math.max((i.value / max) * 100, 1.5)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Usage against a limit, e.g. database size vs the free plan's storage. */
export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-brand";
  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-50" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(pct, 1)}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted">{pct}% of {label}</p>
    </div>
  );
}

const BADGE = {
  green: "bg-brand-50 text-brand-700",
  gray: "bg-canvas text-muted",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-800",
  dark: "bg-forest text-white",
};

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: keyof typeof BADGE }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${BADGE[tone]}`}>{children}</span>;
}

export function PlanBadge({ plan }: { plan: string }) {
  return <Badge tone={plan === "free" ? "gray" : "dark"}>{plan}</Badge>;
}

/** Previous / next links that keep the current filters in the URL. */
export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  params,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
      <span>
        {from}–{to} of {total.toLocaleString("en-US")}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className="btn-ghost btn-sm"><ChevronLeft className="size-4" /> Prev</Link>
        ) : (
          <span className="btn-ghost btn-sm opacity-40"><ChevronLeft className="size-4" /> Prev</span>
        )}
        {page < pages ? (
          <Link href={href(page + 1)} className="btn-ghost btn-sm">Next <ChevronRight className="size-4" /></Link>
        ) : (
          <span className="btn-ghost btn-sm opacity-40">Next <ChevronRight className="size-4" /></span>
        )}
      </div>
    </div>
  );
}

/** Reads one string value from Next's searchParams object. */
export function param(sp: Record<string, string | string[] | undefined>, key: string) {
  const v = sp[key];
  return typeof v === "string" ? v : undefined;
}
