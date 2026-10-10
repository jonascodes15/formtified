import Link from "next/link";
import { CircleAlert, CircleCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { dailySeries, getOverview, getSystemStatus, recentSignups, topFormsByResponses } from "@/lib/admin";
import { compact, formatBytes, initials, percentChange, timeAgo } from "@/lib/format";
import { Card, Meter, PageHeader, PlanBadge, StatTile } from "@/components/admin/ui";
import { ColumnChart } from "@/components/admin/ColumnChart";

export const metadata = { title: "Overview" };

// Neon's free plan includes 0.5 GB of storage per project.
const DB_LIMIT_BYTES = 512 * 1024 * 1024;

export default async function AdminOverview() {
  await requireAdmin();
  const [o, signups, visitors, newest, topForms, status] = await Promise.all([
    getOverview(),
    dailySeries("signups", 30),
    dailySeries("visitors", 30),
    recentSignups(6),
    topFormsByResponses(5),
    getSystemStatus(),
  ]);

  return (
    <>
      <PageHeader title="Overview" description="How Formtified is doing right now.">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 h-9 text-sm font-medium border border-line">
          <span className="relative flex size-2.5">
            {o.online_now > 0 && <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:hidden" />}
            <span className={`relative inline-flex size-2.5 rounded-full ${o.online_now > 0 ? "bg-brand" : "bg-line"}`} />
          </span>
          {o.online_now} online now
        </span>
      </PageHeader>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total users" value={o.users} change={percentChange(o.users_7d, o.users_prev_7d)} hint={`${o.users_7d} new this week`} />
        <StatTile label="Active users (7 days)" value={o.active_7d} hint={`${o.active_1d} in the last 24h`} />
        <StatTile label="Paid subscribers" value={o.paid} hint={o.users ? `${Math.round((o.paid / o.users) * 100)}% of users` : undefined} />
        <StatTile label="Visitors today" value={o.visitors_today} hint={`${compact(o.views_today)} page views`} />
        <StatTile label="Forms created" value={o.forms} hint={`${o.forms_7d} this week`} />
        <StatTile label="Responses collected" value={o.responses} hint={`${o.responses_7d} this week`} />
        <StatTile label="AI forms (30 days)" value={o.ai_forms_30d} hint={`${compact(o.ai_tokens_30d)} tokens`} />
        <StatTile label="Suspended accounts" value={o.suspended} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="New users per day" subtitle="Last 30 days">
          <ColumnChart data={signups} unit="new users" />
        </Card>
        <Card title="Visitors per day" subtitle="Last 30 days" action={<Link href="/admin/analytics" className="text-sm font-medium text-brand-700 hover:underline">Details</Link>}>
          <ColumnChart data={visitors} unit="visitors" />
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Newest users" action={<Link href="/admin/users" className="text-sm font-medium text-brand-700 hover:underline">All users</Link>}>
          {newest.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No users yet.</p>
          ) : (
            <ul className="space-y-3">
              {newest.map((u) => (
                <li key={u.id}>
                  <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 rounded-2xl hover:bg-canvas -mx-2 px-2 py-1">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-medium">{initials(u.name)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{u.name}</span>
                      <span className="block truncate text-xs text-muted">{u.email}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <PlanBadge plan={u.plan} />
                      <span className="block text-[11px] text-soft">{timeAgo(u.created_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Most answered forms" action={<Link href="/admin/forms" className="text-sm font-medium text-brand-700 hover:underline">All forms</Link>}>
          {topForms.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No responses yet.</p>
          ) : (
            <ul className="space-y-3">
              {topForms.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <a href={`/f/${f.slug}`} target="_blank" rel="noopener noreferrer" className="block truncate font-medium hover:underline">{f.title}</a>
                    <span className="block truncate text-xs text-muted">by {f.owner}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted">{f.responses}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="System status">
          <ul className="space-y-2.5 text-sm">
            <StatusRow ok={status.dbMs < 1500} label="Database" detail={`${status.dbMs} ms`} />
            <StatusRow ok={status.ai} label="AI key" detail={status.ai ? "Set" : "AI_API_KEY missing"} />
            <StatusRow ok={status.email} label="Email (Resend)" detail={status.email ? "Set" : "Off: emails are skipped"} warnOnly />
            <StatusRow ok={status.appUrl} label="APP_URL" detail={status.appUrl ? "Set" : "Not set"} warnOnly />
          </ul>
          <div className="mt-5">
            <p className="mb-1.5 text-sm">
              Database size <span className="text-muted">· {formatBytes(status.dbBytes)}</span>
            </p>
            <Meter value={status.dbBytes} max={DB_LIMIT_BYTES} label="Neon free plan (0.5 GB)" />
          </div>
        </Card>
      </div>
    </>
  );
}

function StatusRow({ ok, label, detail, warnOnly }: { ok: boolean; label: string; detail: string; warnOnly?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        {ok ? (
          <CircleCheck className="size-4 text-brand" aria-label="OK" />
        ) : (
          <CircleAlert className={`size-4 ${warnOnly ? "text-amber-500" : "text-red-500"}`} aria-label={warnOnly ? "Warning" : "Problem"} />
        )}
        {label}
      </span>
      <span className="text-right text-muted">{detail}</span>
    </li>
  );
}
