import { requireAdmin } from "@/lib/auth";
import { listAudit } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { PageHeader, Pagination, param } from "@/components/admin/ui";

export const metadata = { title: "Activity log" };

const ACTION_LABEL: Record<string, string> = {
  "user.credits": "Changed credits",
  "user.plan": "Changed plan",
  "user.suspend": "Suspended user",
  "user.unsuspend": "Unsuspended user",
  "user.verify": "Verified email",
  "user.delete": "Deleted user",
  "users.export": "Exported users",
  "form.close": "Closed form",
  "form.reopen": "Reopened form",
  "form.delete": "Deleted form",
  "broadcast.send": "Sent announcement",
};

const describe = (d: Record<string, unknown> | null) =>
  d ? Object.entries(d).map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`).join(" · ") : "";

export default async function ActivityPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const page = Number(param(await searchParams, "page")) || 1;
  const { rows, total, pageSize } = await listAudit(page);

  return (
    <>
      <PageHeader title="Activity log" description="Every change made from the admin dashboard, newest first." />
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Details</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">No admin activity yet.</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(r.created_at, true)}</td>
                <td className="whitespace-nowrap px-4 py-3 font-medium">{ACTION_LABEL[r.action] ?? r.action}</td>
                <td className="max-w-56 truncate px-4 py-3">{r.target ?? "—"}</td>
                <td className="hidden max-w-80 truncate px-4 py-3 text-muted md:table-cell" title={describe(r.details)}>{describe(r.details)}</td>
                <td className="hidden px-4 py-3 text-muted lg:table-cell">{r.admin_email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={pageSize} total={total} basePath="/admin/activity" params={{}} />
    </>
  );
}
