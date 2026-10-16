import Link from "next/link";
import { Check, CheckCircle2, Clock, XCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { FORM_COST, PACKS, SUMMARY_COST, getPack, naira } from "@/lib/credits";
import { confirmPayment, paymentsEnabled, type PaymentResult } from "@/lib/paystack";
import { formatDate } from "@/lib/format";
import { TopBar } from "@/components/app/TopBar";
import { BuyButton } from "@/components/app/BuyButton";
import { RefreshOnce } from "@/components/app/RefreshOnce";

export const metadata = { title: "Credits" };

type Props = { searchParams: Promise<{ reference?: string }> };

export default async function CreditsPage({ searchParams }: Props) {
  const user = await requireUser();
  const enabled = paymentsEnabled();

  // Coming back from Paystack: confirm the payment (this also adds the credits if the webhook hasn't yet).
  const reference = (await searchParams).reference;
  let result: PaymentResult | null = null;
  if (reference && enabled) {
    result = await confirmPayment(reference);
    if (result?.userId !== user.id) result = null;
  }
  const balance = result?.status === "success" ? ((await queryOne<{ credits: number }>("SELECT credits FROM users WHERE id = $1", [user.id]))?.credits ?? user.credits) : user.credits;

  const history = await query<{ reference: string; pack: string; credits: number; amount: number; status: string; created_at: Date; paid_at: Date | null }>(
    `SELECT reference, pack, credits, amount, status, created_at, paid_at FROM payments
     WHERE user_id = $1 AND status = 'success' ORDER BY created_at DESC LIMIT 20`,
    [user.id],
  );

  return (
    <>
      <TopBar name={user.name} title="Credits" back="/dashboard" />

      {result && <PaymentBanner result={result} />}
      {/* The sidebar was drawn before the payment was confirmed; refresh it so it shows the new balance. */}
      {result?.status === "success" && <RefreshOnce />}

      <div className="mt-8 rounded-[2rem] bg-forest p-6 text-white sm:p-8">
        <p className="text-white/70">Available credits</p>
        <p className="display mt-1 text-5xl font-semibold">{balance}</p>
        <p className="mt-2 text-sm text-white/70">
          {FORM_COST} credit = 1 AI-written form · {SUMMARY_COST} credit = 1 AI brief of a response. Templates, editing, file uploads and responses are always free.
        </p>
      </div>

      {!enabled && (
        <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Buying credits is coming soon.</div>
      )}

      <h2 className="display mt-10 text-2xl font-semibold">Top up</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {PACKS.map((p) => (
          <div key={p.id} className={`card flex flex-col p-6 ${p.featured ? "border-brand ring-4 ring-brand/10" : ""}`}>
            <p className="flex items-center justify-between text-sm font-semibold text-brand-700">
              {p.name}
              {p.featured && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs">Best value</span>}
            </p>
            <p className="display mt-2 text-3xl font-semibold">{naira(p.naira)}</p>
            <p className="mt-1 text-muted">{p.credits} credits · {naira(Math.round(p.naira / p.credits))} each</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              <li className="flex items-center gap-2"><Check className="size-4 text-brand" /> {p.note}</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-brand" /> Credits never expire</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-brand" /> Card, bank transfer or USSD</li>
            </ul>
            <div className="mt-auto">
              <BuyButton pack={p.id} label={`Buy ${p.credits} credits`} featured={p.featured} disabled={!enabled} />
            </div>
          </div>
        ))}
      </div>
      {enabled && <p className="mt-3 text-xs text-soft">Payments are processed securely by Paystack. Formtified never sees your card details.</p>}

      {history.length > 0 && (
        <>
          <h2 className="display mt-10 text-2xl font-semibold">Payment history</h2>
          <div className="card mt-4 divide-y divide-line">
            {history.map((h) => (
              <div key={h.reference} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-sm">
                <span>
                  <span className="font-semibold">{getPack(h.pack)?.name ?? h.pack} · {h.credits} credits</span>
                  <span className="block text-xs text-soft">{formatDate(h.paid_at ?? h.created_at, true)} · {h.reference}</span>
                </span>
                <span className="font-semibold">{naira(h.amount / 100)}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="mt-6 text-sm text-muted">
        Questions about a payment? See <Link href="/docs/credits-and-payments" className="text-brand-700 underline">Credits and payments</Link>.
      </p>
    </>
  );
}

function PaymentBanner({ result }: { result: PaymentResult }) {
  const s = {
    success: { Icon: CheckCircle2, cls: "bg-brand-50 text-brand-700", text: `Payment received. ${result.credits} credits were added to your account.` },
    pending: { Icon: Clock, cls: "bg-amber-50 text-amber-900", text: "Your payment is still processing. Your credits will appear as soon as Paystack confirms it; refresh this page in a minute." },
    failed: {
      Icon: XCircle,
      cls: "bg-red-50 text-red-700",
      text: "The payment didn't go through. Please try again. If money left your account, email us with the payment reference and we'll sort it out.",
    },
  }[result.status];
  return (
    <div className={`mt-6 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm animate-rise ${s.cls}`} role="status">
      <s.Icon className="mt-0.5 size-5 shrink-0" />
      <p>{s.text}</p>
    </div>
  );
}
