import { confirmPayment, validWebhookSignature } from "@/lib/paystack";

/**
 * Paystack calls this when a payment succeeds, even if the buyer closed the page before returning.
 * Set it in the Paystack dashboard: Settings → API Keys & Webhooks → Webhook URL = https://formtified.com/api/paystack/webhook
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!validWebhookSignature(raw, req.headers.get("x-paystack-signature"))) {
    return new Response("Invalid signature", { status: 401 });
  }
  let event: { event?: string; data?: { reference?: string } } = {};
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (event.event === "charge.success" && typeof event.data?.reference === "string") {
    // Re-checks the payment with Paystack's API before adding anything.
    await confirmPayment(event.data.reference);
  }
  return new Response("ok");
}
