import { Mail } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { audienceCounts, listBroadcasts } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { BroadcastComposer } from "@/components/admin/BroadcastComposer";

export const metadata = { title: "Notifications" };

const AUDIENCE_LABEL: Record<string, string> = { all: "Everyone", free: "Free users", paid: "Paid subscribers", user: "One user" };

export default async function AdminNotificationsPage() {
  await requireAdmin();
  const [counts, history] = await Promise.all([audienceCounts(), listBroadcasts(30)]);

  return (
    <>
      <PageHeader title="Notifications" description="Send an announcement to everyone, a group, or one person. It appears in their notification bell." />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Card title="New announcement">
          <BroadcastComposer counts={counts} emailEnabled={Boolean(process.env.RESEND_API_KEY)} />
        </Card>

        <Card title="Sent" subtitle={'"Seen" counts people who opened their notifications after it arrived.'}>
          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Nothing sent yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {history.map((b) => (
                <li key={b.id} className="py-3.5 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 font-medium">{b.title}</p>
                    <span className="shrink-0 text-xs text-soft">{formatDate(b.created_at, true)}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted">{b.message}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                    <Badge tone={b.audience === "user" ? "gray" : "green"}>{b.audience === "user" ? b.target_email ?? "Deleted user" : AUDIENCE_LABEL[b.audience] ?? b.audience}</Badge>
                    <span className="text-muted">
                      {b.recipients} sent · {b.seen} seen
                      {b.recipients > 0 && ` (${Math.round((b.seen / b.recipients) * 100)}%)`}
                    </span>
                    {b.via_email && (
                      <span className="inline-flex items-center gap-1 text-muted"><Mail className="size-3.5" /> {b.emails_sent} emails</span>
                    )}
                    {b.admin_name && <span className="text-soft">· by {b.admin_name}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
