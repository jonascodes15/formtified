import { getSessionUser } from "@/lib/auth";
import { fail, ok, unauthorized } from "@/lib/api";
import { sendVerifyCode } from "@/lib/tokens";

/** Emails a new signup code ("Send a new code" on the verify page). */
export async function POST() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.verified) return ok({ next: "/dashboard" });

  const result = await sendVerifyCode(user);
  if (!result.ok) return fail(result.error, result.status);
  return ok();
}
