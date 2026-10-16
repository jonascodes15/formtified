import "server-only";
import crypto from "node:crypto";
import { execute, queryOne } from "./db";
import { receiptEmail, sendEmail } from "./email";
import { getPack, naira, type CreditPack } from "./credits";
import { siteUrl } from "./site";

/**
 * Credit packs are paid on Paystack's own checkout page (card, bank transfer, USSD...).
 * Credits are only added after Formtified asks Paystack's API whether the payment really succeeded,
 * and each payment can add credits only once, however many times it's confirmed.
 */
const API = "https://api.paystack.co";
const secret = () => process.env.PAYSTACK_SECRET_KEY || "";

export const paymentsEnabled = () => Boolean(secret());

async function paystack<T>(path: string, init: RequestInit = {}): Promise<{ ok: boolean; data: T | null; message: string }> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => ({}))) as { status?: boolean; message?: string; data?: T };
  return { ok: res.ok && body.status === true, data: body.data ?? null, message: body.message ?? "" };
}

/** Creates a pending payment and returns the Paystack checkout page to send the user to. */
export async function startCheckout(user: { id: number; email: string }, pack: CreditPack) {
  const reference = `ft_${user.id}_${crypto.randomBytes(8).toString("hex")}`;
  const amount = pack.naira * 100; // Paystack amounts are in kobo
  await execute("INSERT INTO payments (user_id, reference, pack, credits, amount) VALUES ($1, $2, $3, $4, $5)", [
    user.id,
    reference,
    pack.id,
    pack.credits,
    amount,
  ]);
  const res = await paystack<{ authorization_url: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: user.email,
      amount,
      currency: "NGN",
      reference,
      callback_url: `${siteUrl()}/credits?reference=${reference}`,
      metadata: { user_id: user.id, pack: pack.id, credits: pack.credits, cancel_action: `${siteUrl()}/credits` },
    }),
  });
  if (!res.ok || !res.data?.authorization_url) {
    await execute("UPDATE payments SET status = 'failed' WHERE reference = $1", [reference]);
    console.error("Paystack initialize failed", res.message);
    throw new Error("Could not start the payment. Please try again.");
  }
  return res.data.authorization_url;
}

export type PaymentResult = { status: "success" | "pending" | "failed"; credits: number; userId: number | null };

/**
 * Asks Paystack whether a payment went through and, the first time it has, adds the credits.
 * Called when the user returns from checkout and when Paystack's webhook arrives; whichever is first adds them.
 */
export async function confirmPayment(reference: string): Promise<PaymentResult | null> {
  const pay = await queryOne<{ user_id: number | null; pack: string; credits: number; amount: number; currency: string; status: string }>(
    "SELECT user_id, pack, credits, amount, currency, status FROM payments WHERE reference = $1",
    [reference],
  );
  if (!pay) return null;
  const result = (status: PaymentResult["status"]): PaymentResult => ({ status, credits: pay.credits, userId: pay.user_id });
  if (pay.status === "success") return result("success");

  const res = await paystack<{ status: string; amount: number; currency: string; channel?: string }>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
  const tx = res.data;
  if (!tx) return result("pending");
  if (tx.status === "success") {
    if (Number(tx.amount) !== pay.amount || tx.currency !== pay.currency) {
      console.error("Paystack amount mismatch", reference, tx.amount, tx.currency);
      await execute("UPDATE payments SET status = 'failed' WHERE reference = $1 AND status <> 'success'", [reference]);
      return result("failed");
    }
    // One statement: mark the payment paid and add the credits, only if it wasn't already paid.
    // The plan becomes the biggest pack the user has bought (it shows as a paying customer in the admin dashboard).
    const done = await queryOne<{ email: string; name: string; credits: number }>(
      `WITH p AS (
         UPDATE payments SET status = 'success', paid_at = now(), channel = $2
         WHERE reference = $1 AND status <> 'success'
         RETURNING user_id, credits, pack
       )
       UPDATE users u SET
         credits = u.credits + p.credits,
         plan = CASE
           WHEN COALESCE(array_position(ARRAY['free','starter','pro','studio']::text[], u.plan::text), 0)
              < array_position(ARRAY['free','starter','pro','studio']::text[], p.pack::text)
           THEN p.pack ELSE u.plan END
       FROM p WHERE u.id = p.user_id
       RETURNING u.email, u.name, u.credits`,
      [reference, String(tx.channel ?? "").slice(0, 30) || null],
    );
    if (done && pay.user_id) {
      const pack = getPack(pay.pack);
      await execute("INSERT INTO notifications (user_id, kind, title, message, link) VALUES ($1, 'payment', $2, $3, '/credits')", [
        pay.user_id,
        "Payment received",
        `${pay.credits} credits were added to your account.`,
      ]).catch((e) => console.error("payment notification failed", e));
      const mail = receiptEmail(done.name, {
        packName: pack?.name ?? pay.pack,
        credits: pay.credits,
        amount: naira(pay.amount / 100),
        reference,
        balance: done.credits,
      });
      await sendEmail(done.email, mail.subject, mail.html);
    }
    return result("success");
  }
  if (["failed", "abandoned", "reversed"].includes(tx.status)) {
    await execute("UPDATE payments SET status = 'failed' WHERE reference = $1 AND status = 'pending'", [reference]);
    return result("failed");
  }
  return result("pending");
}

/** Paystack signs each webhook with your secret key (HMAC SHA-512 of the raw body). */
export function validWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature || !secret()) return false;
  const expected = crypto.createHmac("sha512", secret()).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
