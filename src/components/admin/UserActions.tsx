"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Coins, MailCheck, ShieldCheck, Trash2 } from "lucide-react";
import { PLANS } from "@/lib/types";

interface Target {
  id: number;
  name: string;
  email: string;
  plan: string;
  credits: number;
  suspended: boolean;
  verified: boolean;
}

/** Credits, plan, suspend and delete controls on a user's admin page. */
export function UserActions({ user, locked }: { user: Target; locked: boolean }) {
  const router = useRouter();
  const [delta, setDelta] = useState("10");
  const [plan, setPlan] = useState(user.plan);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function call(method: "PATCH" | "DELETE", body?: object) {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || "Something went wrong." });
      return null;
    }
    return data;
  }

  async function credits(sign: 1 | -1) {
    const n = Math.round(Number(delta));
    if (!n || n < 0) return setMsg({ ok: false, text: "Enter a positive number of credits." });
    const data = await call("PATCH", { action: "credits", delta: sign * n });
    if (data) {
      setMsg({ ok: true, text: `Credits are now ${data.credits}.` });
      router.refresh();
    }
  }

  async function savePlan() {
    const data = await call("PATCH", { action: "plan", plan });
    if (data) {
      setMsg({ ok: true, text: `Plan changed to ${plan}.` });
      router.refresh();
    }
  }

  async function toggleSuspend() {
    const action = user.suspended ? "unsuspend" : "suspend";
    if (action === "suspend" && !confirm(`Suspend ${user.name}? They will be signed out and can't sign in until you unsuspend them.`)) return;
    const data = await call("PATCH", { action });
    if (data) {
      setMsg({ ok: true, text: action === "suspend" ? "Account suspended." : "Account restored." });
      router.refresh();
    }
  }

  async function verify() {
    if (!confirm(`Mark ${user.email} as verified? ${user.name} will be able to use Formtified without entering the emailed code.`)) return;
    const data = await call("PATCH", { action: "verify" });
    if (data) {
      setMsg({ ok: true, text: "Email marked as verified." });
      router.refresh();
    }
  }

  async function remove() {
    const typed = prompt(`This permanently deletes ${user.name}'s account, forms and responses.\n\nType their email to confirm:`);
    if (typed == null) return;
    if (typed.trim().toLowerCase() !== user.email.toLowerCase()) return setMsg({ ok: false, text: "The email didn't match. Nothing was deleted." });
    const data = await call("DELETE");
    if (data) {
      router.push("/admin/users");
      router.refresh();
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="label flex items-center gap-2"><Coins className="size-4 text-muted" /> Credits <span className="font-normal text-muted">· has {user.credits}</span></p>
        <div className="flex gap-2">
          <input type="number" min={1} value={delta} onChange={(e) => setDelta(e.target.value)} className="input w-24" aria-label="Number of credits" />
          <button disabled={busy} onClick={() => credits(1)} className="btn-primary h-12">Add</button>
          <button disabled={busy} onClick={() => credits(-1)} className="btn-ghost h-12">Remove</button>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="plan">Plan</label>
        <div className="flex gap-2">
          <select id="plan" value={plan} onChange={(e) => setPlan(e.target.value)} className="input flex-1 cursor-pointer capitalize">
            {PLANS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button disabled={busy || plan === user.plan} onClick={savePlan} className="btn-dark h-12">Save</button>
        </div>
      </div>

      {!user.verified && (
        <div className="border-t border-line pt-5">
          <p className="label flex items-center gap-2"><MailCheck className="size-4 text-muted" /> Email not verified</p>
          <p className="mb-3 text-sm text-muted">They haven&apos;t entered the code from their signup email yet. Only do this if you know the address is theirs.</p>
          <button disabled={busy} onClick={verify} className="btn-ghost h-11">
            <MailCheck className="size-4" /> Mark email verified
          </button>
        </div>
      )}

      <div className="border-t border-line pt-5">
        {locked ? (
          <p className="flex items-start gap-2 text-sm text-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
            This is an admin account, so it can&apos;t be suspended or deleted here. Remove it from ADMIN_EMAILS first.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={toggleSuspend} className={`btn h-11 border ${user.suspended ? "border-brand bg-brand-50 text-brand-700" : "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"}`}>
              <Ban className="size-4" /> {user.suspended ? "Unsuspend" : "Suspend"}
            </button>
            <button disabled={busy} onClick={remove} className="btn h-11 border border-red-200 bg-white text-red-600 hover:bg-red-50">
              <Trash2 className="size-4" /> Delete account
            </button>
          </div>
        )}
      </div>

      {msg && (
        <p role="status" className={`rounded-xl px-3 py-2 text-sm ${msg.ok ? "bg-brand-50 text-brand-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>
      )}
    </div>
  );
}
