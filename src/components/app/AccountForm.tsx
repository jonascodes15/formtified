"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Wallet } from "lucide-react";

export function AccountForm({ name: initialName, email, plan, emailNotifications }: { name: string; email: string; plan: string; emailNotifications: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [notify, setNotify] = useState(emailNotifications);
  const [msg, setMsg] = useState("");
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwMsg, setPwMsg] = useState("");

  async function patch(body: object) {
    const res = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    return res.ok ? "" : data.error || "Could not save.";
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const err = await patch({ name });
    setMsg(err || "Saved.");
    if (!err) router.refresh();
  }

  async function toggleNotify(v: boolean) {
    setNotify(v);
    await patch({ email_notifications: v });
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const err = await patch({ currentPassword: pw.current, newPassword: pw.next });
    setPwMsg(err || "Password changed.");
    if (!err) setPw({ current: "", next: "" });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="card p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <label className="label mt-4" htmlFor="name">Name</label>
        <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <p className="mt-1 text-xs text-soft">Clients see this name on your forms.</p>
        <label className="label mt-4" htmlFor="email">Email</label>
        <input id="email" className="input bg-canvas text-muted" value={email} disabled />
        <div className="mt-5 flex items-center gap-3">
          <button className="btn-primary">Save</button>
          {msg && <span className="text-sm text-muted">{msg}</span>}
        </div>
      </form>

      <div className="space-y-5">
        <div className="card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <label className="mt-4 flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-medium">Email me when a client submits a form</span>
              <span className="text-xs text-muted">You always get in-app notifications.</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={notify}
              onClick={() => toggleNotify(!notify)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${notify ? "bg-brand" : "bg-line"}`}
            >
              <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${notify ? "left-6" : "left-1"}`} />
            </button>
          </label>
        </div>

        <div className="card flex items-center justify-between gap-4 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">Plan</h2>
            <p className="text-sm capitalize text-muted">{plan}</p>
          </div>
          <Link href="/credits" className="btn-ghost"><Wallet className="size-4" /> Credits</Link>
        </div>
      </div>

      <form onSubmit={changePassword} className="card p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Change password</h2>
        <label className="label mt-4" htmlFor="cur">Current password</label>
        <input id="cur" type="password" autoComplete="current-password" className="input" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
        <label className="label mt-4" htmlFor="new">New password</label>
        <input id="new" type="password" autoComplete="new-password" minLength={8} className="input" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
        <div className="mt-5 flex items-center gap-3">
          <button className="btn-ghost" disabled={!pw.current || pw.next.length < 8}>Update password</button>
          {pwMsg && <span className="text-sm text-muted">{pwMsg}</span>}
        </div>
      </form>

      <div className="card flex items-center justify-between p-5 sm:p-6 self-start">
        <div>
          <h2 className="text-lg font-semibold">Sign out</h2>
          <p className="text-sm text-muted">{email}</p>
        </div>
        <button onClick={logout} className="btn-ghost text-red-600"><LogOut className="size-4" /> Sign out</button>
      </div>
    </div>
  );
}
