import { Check } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { TopBar } from "@/components/app/TopBar";

export const metadata = { title: "Credits" };

// Payments are not connected yet. When you add Paystack, these packs become buy buttons.
const PACKS = [
  { name: "Starter", credits: 30, price: "₦2,500", note: "Good for a few clients a month" },
  { name: "Pro", credits: 120, price: "₦7,500", note: "For busy freelancers", featured: true },
  { name: "Studio", credits: 400, price: "₦20,000", note: "For agencies and teams" },
];

export default async function CreditsPage() {
  const user = await requireUser();
  return (
    <>
      <TopBar name={user.name} title="Credits" back="/dashboard" />
      <div className="mt-8 rounded-[2rem] bg-forest p-6 sm:p-8 text-white">
        <p className="text-white/70">Available credits</p>
        <p className="display mt-1 text-5xl font-semibold">{user.credits}</p>
        <p className="mt-2 text-sm text-white/70">1 credit = 1 AI-generated form. Templates, editing and responses are always free.</p>
      </div>

      <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Buying credits is coming soon. Prices below are placeholders.
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {PACKS.map((p) => (
          <div key={p.name} className={`card flex flex-col p-6 ${p.featured ? "border-brand ring-4 ring-brand/10" : ""}`}>
            <p className="text-sm font-semibold text-brand-700">{p.name}</p>
            <p className="display mt-2 text-3xl font-semibold">{p.price}</p>
            <p className="mt-1 text-muted">{p.credits} credits</p>
            <p className="mt-4 flex items-center gap-2 text-sm"><Check className="size-4 text-brand" /> {p.note}</p>
            <p className="flex items-center gap-2 text-sm"><Check className="size-4 text-brand" /> Credits never expire</p>
            <button disabled className="btn-primary mt-6">Coming soon</button>
          </div>
        ))}
      </div>
    </>
  );
}
