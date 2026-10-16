"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

/** Starts a Paystack checkout for one credit pack and sends the browser to Paystack's payment page. */
export function BuyButton({ pack, label, featured, disabled }: { pack: string; label: string; featured?: boolean; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function buy() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/credits/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pack }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      setBusy(false);
      setError(data.error || "Could not start the payment. Please try again.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="mt-6">
      <button onClick={buy} disabled={busy || disabled} className={`${featured ? "btn-primary" : "btn-dark"} w-full`}>
        {disabled ? "Coming soon" : busy ? "Opening Paystack…" : <><Lock className="size-4" /> {label}</>}
      </button>
      {error && <p className="mt-2 text-sm text-red-600 animate-error-in">{error}</p>}
    </div>
  );
}
