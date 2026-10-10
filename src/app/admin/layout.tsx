import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Formtified" },
  robots: { index: false, follow: false },
};

/** Every page under /admin goes through this check. Non-admins get a 404. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <AdminShell name={admin.name} email={admin.email}>
      {children}
    </AdminShell>
  );
}
