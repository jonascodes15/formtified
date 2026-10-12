import { getSessionUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { fail, ok, readJson, unauthorized } from "@/lib/api";
import { checkVerifyCode } from "@/lib/tokens";

/** Checks the 6-digit code from the signup email. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.verified) return ok({ next: "/dashboard" });

  const body = await readJson<{ code?: string }>(req);
  const code = String(body?.code ?? "").replace(/\D/g, "");
  if (code.length !== 6) return fail("Enter the 6-digit code from the email.");

  const result = await checkVerifyCode(user.id, code);
  if (!result.ok) return fail(result.error);

  // New accounts start at the AI generator; anyone who already has forms goes to the dashboard.
  const hasForms = await queryOne("SELECT 1 FROM forms WHERE user_id = $1 LIMIT 1", [user.id]);
  return ok({ next: hasForms ? "/dashboard" : "/generate" });
}
