"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { AuthShell, Field, FormError } from "./AuthShell";

export function AuthScreen({ initialMode }: { initialMode: "signin" | "signup" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function switchMode(m: "signin" | "signup") {
    setMode(m);
    setError("");
    window.history.replaceState(null, "", m === "signup" ? "/signup" : "/login");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch(mode === "signup" ? "/api/auth/signup" : "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      setError(data.error || "Something went wrong.");
      return;
    }
    // New and unverified accounts go to /verify to enter the emailed code first.
    router.push(data.next || (mode === "signup" ? "/generate" : "/dashboard"));
    router.refresh();
  }

  return (
    <AuthShell>
      <h1 className="display text-center text-3xl font-semibold">Welcome to Formtified</h1>
      <p className="mt-2 text-center text-muted">
        {mode === "signin" ? "Sign in to see your forms and client responses." : "Create a free account. You get 20 AI credits to start."}
      </p>

      <div className="mt-7 grid grid-cols-2 rounded-2xl border border-line p-1">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`h-11 rounded-xl text-sm font-medium transition ${mode === m ? "bg-brand-50 text-brand-700" : "text-muted hover:text-ink"}`}
          >
            {m === "signin" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <Field icon={UserRound} label="Full name">
            <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="w-full bg-transparent outline-none" />
          </Field>
        )}
        <Field icon={Mail} label="Email Address">
          <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="w-full bg-transparent outline-none" />
        </Field>
        <div>
          <Field icon={Lock} label="Password">
            <input
              required
              type={show ? "text" : "password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={mode === "signup" ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "At least 8 characters" : "Enter your password"}
              className="w-full bg-transparent outline-none"
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="text-muted">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </Field>
          {mode === "signin" && (
            <p className="mt-2 text-right text-sm">
              <Link href="/forgot-password" className="text-brand-700 hover:underline">Forgot password?</Link>
            </p>
          )}
        </div>
        <FormError error={error} />
        <button disabled={busy} className="btn-primary h-12 w-full rounded-2xl text-[15px]">
          {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
