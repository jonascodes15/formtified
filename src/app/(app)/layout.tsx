import { isAdmin, requireUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { AppShell } from "@/components/app/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = await queryOne<{ n: string }>(
    "SELECT COUNT(*) AS n FROM responses r JOIN forms f ON f.id = r.form_id WHERE f.user_id = $1 AND r.is_read = false",
    [user.id],
  );
  return (
    <AppShell credits={user.credits} unreadResponses={Number(unread?.n ?? 0)} isAdmin={isAdmin(user.email)}>
      {children}
    </AppShell>
  );
}
