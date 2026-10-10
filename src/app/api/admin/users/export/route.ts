import { apiAdmin } from "@/lib/auth";
import { fail } from "@/lib/api";
import { exportUsers, logAdminAction } from "@/lib/admin";
import { csvCell } from "@/lib/format";

/** Downloads the users list (with the same filters as the Users page) as a CSV file. */
export async function GET(req: Request) {
  const admin = await apiAdmin();
  if (!admin) return fail("Not found.", 404);
  const sp = new URL(req.url).searchParams;
  const rows = await exportUsers({
    q: sp.get("q") ?? undefined,
    plan: sp.get("plan") ?? undefined,
    status: sp.get("status") ?? undefined,
  });

  const header = ["ID", "Name", "Email", "Plan", "Credits", "Forms", "Responses", "Email notifications", "Joined", "Last seen", "Suspended"];
  const lines = rows.map((u) =>
    [u.id, u.name, u.email, u.plan, u.credits, u.forms, u.responses, u.email_notifications ? "yes" : "no", u.created_at, u.last_seen_at ?? "", u.suspended_at ?? ""]
      .map(csvCell)
      .join(","),
  );
  await logAdminAction(admin, "users.export", null, { rows: rows.length });

  const csv = "﻿" + [header.map(csvCell).join(","), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="formtified-users-${date}.csv"`,
    },
  });
}
