import Link from "next/link";
import { ArrowUpRight, Shield } from "lucide-react";
import { isAdmin, requireUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { TopBar } from "@/components/app/TopBar";
import { AccountForm } from "@/components/app/AccountForm";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();
  // COUNT(*) comes back from Postgres as a string; Number() below converts it.
  const stats = await queryOne<{ forms: string; responses: string; generated: string }>(
    `SELECT
      (SELECT COUNT(*) FROM forms WHERE user_id = $1) AS forms,
      (SELECT COUNT(*) FROM responses r JOIN forms f ON f.id = r.form_id WHERE f.user_id = $1) AS responses,
      (SELECT COUNT(*) FROM ai_usage WHERE user_id = $1 AND kind = 'generate') AS generated`,
    [user.id],
  );
  return (
    <>
      <TopBar name={user.name} title="Account" />
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          ["Forms", stats?.forms],
          ["Responses", stats?.responses],
          ["Credits left", user.credits],
        ].map(([label, value]) => (
          <div key={label as string} className="card p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-muted">{label}</p>
            <p className="display mt-1 text-2xl sm:text-3xl font-semibold">{Number(value ?? 0)}</p>
          </div>
        ))}
      </div>
      {isAdmin(user.email) && (
        <Link href="/admin" className="card mt-3 flex items-center justify-between gap-4 bg-forest p-5 text-white hover:bg-forest-800">
          <span className="flex items-center gap-3">
            <Shield className="size-5 text-lime" />
            <span>
              <span className="block font-semibold">Admin dashboard</span>
              <span className="text-sm text-white/70">Users, site visits and announcements</span>
            </span>
          </span>
          <ArrowUpRight className="size-5" />
        </Link>
      )}
      <AccountForm name={user.name} email={user.email} plan={user.plan} emailNotifications={user.email_notifications} />
    </>
  );
}
