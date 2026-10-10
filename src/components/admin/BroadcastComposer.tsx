"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Mail, Send } from "lucide-react";

type Audience = "all" | "free" | "paid" | "user";

/**
 * Write an announcement and send it as an in-app notification (and optionally by email).
 * With `fixedUser` it only sends to that one person (used on a user's admin page).
 */
export function BroadcastComposer({
  counts,
  emailEnabled,
  fixedUser,
}: {
  counts?: { all: number; free: number; paid: number };
  emailEnabled: boolean;
  fixedUser?: { id: number; name: string; email: string };
}) {
  const router = useRouter();
  const [audience, setAudience] = useState<Audience>(fixedUser ? "user" : "all");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [viaEmail, setViaEmail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const options: { value: Audience; label: string; count?: number }[] = [
    { value: "all", label: "Everyone", count: counts?.all },
    { value: "free", label: "Free users", count: counts?.free },
    { value: "paid", label: "Paid subscribers", count: counts?.paid },
    { value: "user", label: "One user" },
  ];
  const recipientText = fixedUser
    ? fixedUser.name
    : audience === "user"
      ? email || "one user"
      : `${options.find((o) => o.value === audience)?.count ?? 0} users`;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    if (!fixedUser && audience !== "user" && !confirm(`Send "${title}" to ${recipientText}${viaEmail ? " by notification and email" : ""}?`)) return;
    setBusy(true);
    const res = await fetch("/api/admin/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audience, userId: fixedUser?.id, email: fixedUser ? undefined : email, title, message, link, viaEmail }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setResult({ ok: false, text: data.error || "Could not send." });
    setResult({
      ok: true,
      text: `Sent to ${data.recipients} ${data.recipients === 1 ? "person" : "people"}${viaEmail ? ` · ${data.emailsSent} ${data.emailsSent === 1 ? "email" : "emails"} sent` : ""}.`,
    });
    setTitle("");
    setMessage("");
    setLink("");
    router.refresh();
  }

  return (
    <form onSubmit={send} className="space-y-4">
      {!fixedUser && (
        <fieldset>
          <legend className="label">Send to</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {options.map((o) => (
              <label
                key={o.value}
                className={`cursor-pointer rounded-2xl border px-3 py-2.5 text-sm transition ${audience === o.value ? "border-brand bg-brand-50" : "border-line bg-white hover:border-brand/50"}`}
              >
                <input type="radio" name="audience" value={o.value} checked={audience === o.value} onChange={() => setAudience(o.value)} className="sr-only" />
                <span className="block font-medium">{o.label}</span>
                <span className="text-xs text-muted">{o.count != null ? `${o.count.toLocaleString("en-US")} users` : "By email address"}</span>
              </label>
            ))}
          </div>
          {audience === "user" && (
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="their@email.com" className="input mt-2" aria-label="User's email" />
          )}
        </fieldset>
      )}

      <div>
        <label className="label" htmlFor="b-title">Title</label>
        <input id="b-title" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New templates are here" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="b-msg">Message</label>
        <textarea id="b-msg" required maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What do you want to tell them?" className="textarea" />
        <p className="mt-1 text-right text-xs text-soft">{message.length}/1000</p>
      </div>
      <div>
        <label className="label" htmlFor="b-link">Link <span className="font-normal text-muted">(optional)</span></label>
        <input id="b-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/templates or https://..." className="input" />
      </div>

      <label className={`flex items-start gap-3 rounded-2xl border border-line p-3 ${emailEnabled ? "cursor-pointer" : "opacity-60"}`}>
        <input type="checkbox" disabled={!emailEnabled} checked={viaEmail} onChange={(e) => setViaEmail(e.target.checked)} className="mt-1 size-4 accent-[var(--color-brand)]" />
        <span className="text-sm">
          <span className="flex items-center gap-1.5 font-medium"><Mail className="size-4" /> Also send by email</span>
          <span className="text-xs text-muted">
            {emailEnabled
              ? fixedUser || audience === "user"
                ? "A message to one person is always emailed."
                : "Only users who have email notifications turned on get the email. Resend's free plan allows 100 emails a day."
              : "Add RESEND_API_KEY to turn on emails."}
          </span>
        </span>
      </label>

      {(title || message) && (
        <div className="rounded-2xl bg-canvas p-3">
          <p className="mb-2 text-xs font-medium text-muted">Preview in the notification bell</p>
          <div className="flex gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-[var(--shadow-card)]">
            <Bell className="mt-0.5 size-4 shrink-0 text-brand" />
            <span className="min-w-0 text-sm">
              <span className="block font-semibold">{title || "Title"}</span>
              <span className="block whitespace-pre-wrap leading-snug text-muted">{message || "Message"}</span>
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={busy || !title.trim() || !message.trim()} className="btn-primary">
          <Send className="size-4" /> {busy ? "Sending…" : `Send to ${recipientText}`}
        </button>
        {result && (
          <span role="status" className={`text-sm ${result.ok ? "text-brand-700" : "text-red-600"}`}>{result.text}</span>
        )}
      </div>
    </form>
  );
}
