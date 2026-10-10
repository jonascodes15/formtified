import { Download } from "lucide-react";
import { adminEmails, requireAdmin } from "@/lib/auth";
import { listUsers } from "@/lib/admin";
import { PageHeader, Pagination, param } from "@/components/admin/ui";
import { UserFilters } from "@/components/admin/UserFilters";
import { UsersTable } from "@/components/admin/UsersTable";

export const metadata = { title: "Users" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const filters = {
    q: param(sp, "q"),
    plan: param(sp, "plan"),
    status: param(sp, "status"),
    sort: param(sp, "sort"),
  };
  const page = Number(param(sp, "page")) || 1;
  const { rows, total, pageSize } = await listUsers({ ...filters, page });
  const exportQs = new URLSearchParams(Object.entries(filters).filter((e): e is [string, string] => Boolean(e[1]))).toString();

  return (
    <>
      <PageHeader title="Users" description={`${total.toLocaleString("en-US")} ${total === 1 ? "account matches" : "accounts match"}.`}>
        <a href={`/api/admin/users/export${exportQs ? `?${exportQs}` : ""}`} className="btn-ghost btn-sm">
          <Download className="size-4" /> Export CSV
        </a>
      </PageHeader>
      <UserFilters action="/admin/users" values={filters} />
      <UsersTable rows={rows} adminEmails={adminEmails()} />
      <Pagination page={page} pageSize={pageSize} total={total} basePath="/admin/users" params={filters} />
    </>
  );
}
