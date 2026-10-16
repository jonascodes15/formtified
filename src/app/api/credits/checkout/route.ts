import { apiUser } from "@/lib/auth";
import { fail, ok, readJson, unauthorized } from "@/lib/api";
import { getPack } from "@/lib/credits";
import { paymentsEnabled, startCheckout } from "@/lib/paystack";

/** Starts buying a credit pack: returns the Paystack checkout page to open. */
export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return unauthorized();
  if (!paymentsEnabled()) return fail("Payments aren't available yet. Please try again later.", 503);
  const pack = getPack((await readJson<{ pack?: string }>(req))?.pack);
  if (!pack) return fail("Choose a credit pack.");
  try {
    return ok({ url: await startCheckout(user, pack) });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Could not start the payment.", 502);
  }
}
