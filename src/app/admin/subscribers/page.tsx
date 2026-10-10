import { adminEmails, requireAdmin } from "@/lib/auth";
import { emailOptInCount, listUsers, planBreakdown } from "@/lib/admin";
import { PLANS } from "@/lib/types";
import { BarList, Card, PageHeader, Pagination, StatTile, param } from "@/components/admin/ui";
import { UserFilters } from "@/components/admin/UserFilters";
import { UsersTable } from "@/components/admin/UsersTable";

export const metadata = { title: "Subscribers" };

const PAID = PLANS.filter((p) => p !== "free");
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export default async function SubscribersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const chosen = param(sp, "plan");
  const filters = {
    q: param(sp, "q"),
    plan: chosen && (PAID as string[]).includes(chosen) ? chosen : undefined,
    status: param(sp, "status"),
    sort: param(sp, "sort"),
  };
  const page = Number(param(sp, "page")) || 1;
  const [plans, optIn, list] = await Promise.all([
    planBreakdown(),
    emailOptInCount(),
    listUsers({ ...filters, plan: filters.plan ?? "paid", page }),
  ]);

  const total = plans.reduce((s, p) => s + p.users, 0);
  const paid = plans.filter((p) => p.plan !== "free");
  const paidCount = paid.reduce((s, p) => s + p.users, 0);
  const paidActive = paid.reduce((s, p) => s + p.active30d, 0);

  return (
    <>
      <PageHeader title="Subscribers" description="Users on a paid plan. Change someone's plan from their user page." />

      <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Payments aren&apos;t connected yet, so plans are set by hand. Once Paystack is added, plans will update when people pay.
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Paid subscribers" value={paidCount} hint={total ? `${Math.round((paidCount / total) * 100)}% of all users` : undefined} />
        <StatTile label="Active subscribers" value={paidActive} hint="Seen in the last 30 days" />
        <StatTile label="Free users" value={plans.find((p) => p.plan === "free")?.users ?? 0} />
        <StatTile label="Email opt-ins" value={optIn} hint="Users who allow emails" />
      </div>

      <Card title="Users by plan" className="mt-5">
        <BarList
          valueLabel="users"
          items={plans.map((p) => ({ key: p.plan, label: `${cap(p.plan)} · ${p.active30d} active`, value: p.users }))}
          empty="No users yet."
        />
      </Card>

      <h2 className="display mt-8 text-xl font-semibold">Paid users</h2>
      <UserFilters
        action="/admin/subscribers"
        values={filters}
        planOptions={[{ value: "", label: "All paid plans" }, ...PAID.map((p) => ({ value: p, label: cap(p) }))]}
      />
      <UsersTable rows={list.rows} adminEmails={adminEmails()} />
      <Pagination page={page} pageSize={list.pageSize} total={list.total} basePath="/admin/subscribers" params={filters} />
    </>
  );
}
