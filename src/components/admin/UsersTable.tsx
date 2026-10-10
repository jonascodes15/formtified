import Link from "next/link";
import type { AdminUserRow } from "@/lib/admin";
import { formatDate, initials, timeAgo } from "@/lib/format";
import { Badge, PlanBadge } from "./ui";

export function UsersTable({ rows, adminEmails }: { rows: AdminUserRow[]; adminEmails: string[] }) {
  return (
    <div className="card mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-line text-left text-xs text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Plan</th>
            <th className="px-4 py-3 font-medium text-right">Credits</th>
            <th className="hidden px-4 py-3 font-medium text-right md:table-cell">Forms</th>
            <th className="hidden px-4 py-3 font-medium text-right md:table-cell">Responses</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Joined</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Last seen</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-muted">No users match these filters.</td>
            </tr>
          )}
          {rows.map((u) => (
            <tr key={u.id} className="hover:bg-canvas/60">
              <td className="px-4 py-3">
                <Link href={`/admin/users/${u.id}`} className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-medium">{initials(u.name)}</span>
                  <span className="min-w-0">
                    <span className="flex max-w-60 items-center gap-1.5 font-medium">
                      <span className="truncate hover:underline">{u.name}</span>
                      {adminEmails.includes(u.email.toLowerCase()) && <Badge tone="green">admin</Badge>}
                    </span>
                    <span className="block max-w-60 truncate text-xs text-muted">{u.email}</span>
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
              <td className="px-4 py-3 text-right tabular-nums">{u.credits}</td>
              <td className="hidden px-4 py-3 text-right tabular-nums md:table-cell">{u.forms}</td>
              <td className="hidden px-4 py-3 text-right tabular-nums md:table-cell">{u.responses}</td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-muted lg:table-cell">{formatDate(u.created_at)}</td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-muted lg:table-cell">{u.last_seen_at ? timeAgo(u.last_seen_at) : "Never"}</td>
              <td className="px-4 py-3">{u.suspended_at ? <Badge tone="red">Suspended</Badge> : <Badge tone="green">Active</Badge>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
