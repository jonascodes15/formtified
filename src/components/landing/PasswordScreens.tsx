"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, Mail, MailCheck } from "lucide-react";
import { AuthShell, Field, FormError } from "./AuthShell";

function BackToSignIn() {
  return (
    <p className="mt-6 text-center text-sm">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
    </p>
  );
}

function Badge({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
      <Icon className="size-7" />
    </span>
  );
}

/** "Forgot password?": asks for the email and sends a reset link. */
export function ForgotScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Something went wrong.");
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell>
        <Badge icon={MailCheck} />
        <h1 className="display mt-5 text-center text-3xl font-semibold">Check your email</h1>
        <p className="mt-2 text-center text-muted">
          If there&apos;s a Formtified account for <span className="font-medium text-ink break-all">{email}</span>, we&apos;ve sent it a link to choose a new password. The link expires in 1 hour.
        </p>
        <p className="mt-4 text-center text-sm text-soft">Nothing arrived? Check your spam folder, or wait a minute and try again.</p>
        <button type="button" onClick={() => setSent(false)} className="btn-ghost mt-6 h-12 w-full rounded-2xl text-[15px]">
          Try a different email
        </button>
        <BackToSignIn />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Badge icon={KeyRound} />
      <h1 className="display mt-5 text-center text-3xl font-semibold">Forgot your password?</h1>
      <p className="mt-2 text-center text-muted">Enter the email you signed up with and we&apos;ll send you a link to choose a new one.</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <Field icon={Mail} label="Email Address">
          <input required autoFocus type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="w-full bg-transparent outline-none" />
        </Field>
        <FormError error={error} />
        <button disabled={busy} className="btn-primary h-12 w-full rounded-2xl text-[15px]">
          {busy ? "Please wait…" : "Send reset link"}
        </button>
      </form>
      <BackToSignIn />
    </AuthShell>
  );
}

/** Opened from the emailed link: choose a new password. */
export function ResetScreen({ token, valid }: { token: string; valid: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [expired, setExpired] = useState(!valid);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      if (res.status === 410) return setExpired(true);
      return setError(data.error || "Something went wrong.");
    }
    router.push(data.next || "/dashboard");
    router.refresh();
  }

  if (expired) {
    return (
      <AuthShell>
        <Badge icon={KeyRound} />
        <h1 className="display mt-5 text-center text-3xl font-semibold">This link has expired</h1>
        <p className="mt-2 text-center text-muted">Reset links work once and last 1 hour. Ask for a new one and use the newest email.</p>
        <Link href="/forgot-password" className="btn-primary mt-7 h-12 w-full rounded-2xl text-[15px]">
          Send a new link
        </Link>
        <BackToSignIn />
      </AuthShell>
    );
  }

  const toggle = (
    <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="text-muted">
      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );

  return (
    <AuthShell>
      <Badge icon={KeyRound} />
      <h1 className="display mt-5 text-center text-3xl font-semibold">Choose a new password</h1>
      <p className="mt-2 text-center text-muted">You&apos;ll be signed in straight after, and signed out on your other devices.</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <Field icon={Lock} label="New password">
          <input required autoFocus minLength={8} type={show ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="w-full bg-transparent outline-none" />
          {toggle}
        </Field>
        <Field icon={Lock} label="Type it again">
          <input required minLength={8} type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Same password again" className="w-full bg-transparent outline-none" />
        </Field>
        <FormError error={error} />
        <button disabled={busy} className="btn-primary h-12 w-full rounded-2xl text-[15px]">
          {busy ? "Please wait…" : "Save new password"}
        </button>
      </form>
      <BackToSignIn />
    </AuthShell>
  );
}
