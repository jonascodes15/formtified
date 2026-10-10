import { apiAdmin, isAdmin } from "@/lib/auth";
import { fail, notFound, ok, readJson } from "@/lib/api";
import { adjustCredits, deleteUser, getUserBasic, logAdminAction, setPlan, setSuspended } from "@/lib/admin";
import { PLANS } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

const forbidden = () => fail("Not found.", 404);

/** Admin changes to one user: { action: "credits", delta } | { action: "plan", plan } | { action: "suspend" | "unsuspend" } */
export async function PATCH(req: Request, { params }: Ctx) {
  const admin = await apiAdmin();
  if (!admin) return forbidden();
  const target = await getUserBasic(Number((await params).id) || 0);
  if (!target) return notFound();
  const body = await readJson<{ action?: string; delta?: number; plan?: string }>(req);

  switch (body?.action) {
    case "credits": {
      const delta = Math.trunc(Number(body.delta));
      if (!delta || Math.abs(delta) > 100_000) return fail("Enter a number of credits between 1 and 100,000.");
      const credits = await adjustCredits(target.id, delta);
      await logAdminAction(admin, "user.credits", target.email, { delta, credits });
      return ok({ ok: true, credits });
    }
    case "plan": {
      const plan = String(body.plan ?? "");
      if (!(PLANS as readonly string[]).includes(plan)) return fail("Unknown plan.");
      await setPlan(target.id, plan);
      await logAdminAction(admin, "user.plan", target.email, { from: target.plan, to: plan });
      return ok();
    }
    case "suspend":
    case "unsuspend": {
      const suspend = body.action === "suspend";
      if (suspend && (target.id === admin.id || isAdmin(target.email))) return fail("Admin accounts can't be suspended.");
      await setSuspended(target.id, suspend);
      await logAdminAction(admin, suspend ? "user.suspend" : "user.unsuspend", target.email);
      return ok();
    }
    default:
      return fail("Unknown action.");
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const admin = await apiAdmin();
  if (!admin) return forbidden();
  const target = await getUserBasic(Number((await params).id) || 0);
  if (!target) return notFound();
  if (target.id === admin.id || isAdmin(target.email)) return fail("Admin accounts can't be deleted here.");
  await deleteUser(target.id);
  await logAdminAction(admin, "user.delete", target.email, { name: target.name });
  return ok();
}
