import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { getUserDetail } from "@/lib/admin";
import { compact, formatDate, initials, timeAgo } from "@/lib/format";
import { Badge, Card, PlanBadge, StatTile } from "@/components/admin/ui";
import { UserActions } from "@/components/admin/UserActions";
import { BroadcastComposer } from "@/components/admin/BroadcastComposer";

export const metadata = { title: "User" };

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const detail = await getUserDetail(Number((await params).id) || 0);
  if (!detail) notFound();
  const { user: u, stats, forms } = detail;
  const userIsAdmin = isAdmin(u.email);

  return (
    <>
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All users
      </Link>

      <header className="mt-4 flex flex-wrap items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-100 text-lg font-medium">{initials(u.name)}</span>
        <div className="min-w-0">
          <h1 className="display truncate text-2xl sm:text-3xl font-semibold">{u.name}</h1>
          <p className="truncate text-muted">{u.email}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <PlanBadge plan={u.plan} />
            {u.suspended_at ? <Badge tone="red">Suspended {timeAgo(u.suspended_at)}</Badge> : <Badge tone="green">Active</Badge>}
            {userIsAdmin && <Badge tone="dark">Admin</Badge>}
            {!u.email_notifications && <Badge>Emails off</Badge>}
          </div>
        </div>
      </header>
      <p className="mt-3 text-sm text-muted">
        Joined {formatDate(u.created_at)} · Last seen {u.last_seen_at ? timeAgo(u.last_seen_at) : "never"}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Credits" value={u.credits} />
        <StatTile label="Forms" value={u.forms} />
        <StatTile label="Responses" value={u.responses} />
        <StatTile label="AI forms" value={stats.aiForms} hint={`${stats.aiCalls} AI calls`} />
        <StatTile label="AI tokens" value={stats.aiTokens} hint={`${compact(stats.pageViews)} page views`} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Manage account">
          <UserActions
            user={{ id: u.id, name: u.name, email: u.email, plan: u.plan, credits: u.credits, suspended: Boolean(u.suspended_at) }}
            locked={userIsAdmin || u.id === admin.id}
          />
        </Card>
        <Card title="Send a message" subtitle="Shows up in their notification bell">
          <BroadcastComposer emailEnabled={Boolean(process.env.RESEND_API_KEY)} fixedUser={{ id: u.id, name: u.name, email: u.email }} />
        </Card>
      </div>

      <Card title={`Forms (${u.forms})`} className="mt-5">
        {forms.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No forms yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {forms.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">
                  <a href={`/f/${f.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 font-medium hover:underline">
                    <span className="truncate">{f.title}</span> <ExternalLink className="size-3.5 shrink-0 text-muted" />
                  </a>
                  <span className="block text-xs text-muted">
                    {formatDate(f.created_at)} · {f.source}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  {f.status === "closed" && <Badge>Closed</Badge>}
                  <span className="tabular-nums text-muted">{f.responses} responses</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
