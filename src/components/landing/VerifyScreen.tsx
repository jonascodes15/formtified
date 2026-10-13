"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { AuthShell, FormError } from "./AuthShell";

const COOLDOWN = 45; // seconds, matches the server's limit

/** Enter the 6-digit code emailed at signup. */
export function VerifyScreen({ email, next }: { email: string; next?: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(COOLDOWN);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function verify(value: string) {
    if (busy) return;
    setError("");
    setNotice("");
    setBusy(true);
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: value }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      setError(data.error || "Something went wrong.");
      setCode("");
      input.current?.focus();
      return;
    }
    router.push(next || data.next || "/dashboard");
    router.refresh();
  }

  function onChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (error) setError("");
    // Checks by itself once all six digits are in, including when the code is pasted.
    if (digits.length === 6) verify(digits);
  }

  async function resend() {
    setError("");
    setNotice("");
    setBusy(true);
    const res = await fetch("/api/auth/verify/resend", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Something went wrong.");
    if (data.next) {
      router.push(next || data.next);
      return;
    }
    setNotice(`A new code is on its way to ${email}.`);
    setWait(COOLDOWN);
    setCode("");
    input.current?.focus();
  }

  async function differentEmail() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(next ? `/signup?next=${encodeURIComponent(next)}` : "/signup");
    router.refresh();
  }

  return (
    <AuthShell>
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <MailCheck className="size-7" />
      </span>
      <h1 className="display mt-5 text-center text-3xl font-semibold">Check your email</h1>
      <p className="mt-2 text-center text-muted">
        We sent a 6-digit code to <span className="font-medium text-ink break-all">{email}</span>. Enter it below to finish signing up.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify(code);
        }}
        className="mt-7 space-y-4"
      >
        <label className="block">
          <span className="label">Code <span className="text-brand">*</span></span>
          <input
            ref={input}
            autoFocus
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            placeholder="000000"
            aria-describedby="code-help"
            className="h-14 w-full rounded-2xl border border-line px-4 text-center text-2xl font-semibold tracking-[0.5em] tabular-nums outline-none placeholder:text-line focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </label>
        <p id="code-help" className="text-center text-xs text-soft">The code expires in 15 minutes. Check your spam folder if you can&apos;t find it.</p>
        <FormError error={error} />
        {notice && <p role="status" className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-700">{notice}</p>}
        <button disabled={busy || code.length !== 6} className="btn-primary h-12 w-full rounded-2xl text-[15px]">
          {busy ? "Please wait…" : "Verify email"}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm">
        <button type="button" onClick={resend} disabled={busy || wait > 0} className="font-medium text-brand-700 hover:underline disabled:text-soft disabled:no-underline">
          {wait > 0 ? `Send a new code in ${wait}s` : "Send a new code"}
        </button>
        <button type="button" onClick={differentEmail} className="text-muted hover:text-ink">
          Wrong email? Sign up with a different one
        </button>
      </div>
    </AuthShell>
  );
}
