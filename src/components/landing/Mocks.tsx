import { Check, FileText, Sparkles } from "lucide-react";
import { LogoTile } from "@/components/Logo";

/* Small illustrative UI cards used on the landing and sign-in pages. */

export function MockChatCard() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-float)] text-left">
      <p className="text-[11px] font-semibold text-muted">Generate with AI</p>
      <div className="mt-2 rounded-xl rounded-br-sm bg-forest px-3 py-2 text-[11px] leading-snug text-white">
        Client wants a bakery website with online ordering and delivery in Lekki.
      </div>
      <div className="mt-2 flex gap-2">
        <LogoTile className="size-5" />
        <div className="rounded-xl rounded-tl-sm border border-line px-3 py-2 text-[11px] leading-snug">
          Should the form ask about payment options?
          <div className="mt-1.5 flex gap-1">
            <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">Yes</span>
            <span className="rounded-full border border-line px-2 py-0.5 text-[10px]">Not needed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MockFormCard() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-float)] text-left">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-brand-50"><FileText className="size-3.5" /></span>
        <p className="text-[11px] font-semibold">Bakery Website Onboarding</p>
      </div>
      <p className="mt-3 text-[10px] font-semibold text-brand-700">YOUR PROJECT</p>
      <p className="mt-1 text-[11px] font-medium">List every feature you want</p>
      <div className="mt-1 h-10 rounded-lg border border-line bg-canvas px-2 py-1 text-[10px] text-muted">1. Online menu with prices…</div>
      <p className="mt-2 text-[11px] font-medium">Payment options</p>
      <div className="mt-1 space-y-1">
        {["Card (Paystack)", "Bank transfer"].map((o, i) => (
          <div key={o} className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] ${i === 0 ? "border-brand bg-brand-50" : "border-line"}`}>
            <span className={`grid size-3 place-items-center rounded ${i === 0 ? "bg-brand text-white" : "border border-line"}`}>{i === 0 && <Check className="size-2" strokeWidth={4} />}</span>
            {o}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MockResponseCard() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-float)] text-left">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold">New response</p>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">just now</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-brand-100 text-[11px] font-medium">AO</span>
        <div>
          <p className="text-[12px] font-semibold">Adaeze O.</p>
          <p className="text-[10px] text-muted">Bakery Website Onboarding</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
        {[["18", "answers"], ["6", "features"], ["₦800k", "budget"]].map(([v, l]) => (
          <div key={l} className="rounded-lg bg-canvas py-1.5">
            <p className="text-[12px] font-semibold">{v}</p>
            <p className="text-[9px] text-muted">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-forest py-1.5 text-[10px] font-medium text-white">
        <Sparkles className="size-3" /> View full brief
      </div>
    </div>
  );
}
