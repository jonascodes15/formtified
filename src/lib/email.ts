import "server-only";

/**
 * Sends email through Resend (free tier: 3,000 emails/month).
 * If RESEND_API_KEY is not set, emails are skipped and only in-app notifications are used.
 */
export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { skipped: true };
  const from = process.env.EMAIL_FROM || "Formtified <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("Email failed", res.status, await res.text().catch(() => ""));
    return { sent: res.ok };
  } catch (e) {
    console.error("Email error", e);
    return { sent: false };
  }
}

/**
 * Sends the same email to many people, one separate email each (nobody sees the others' addresses).
 * Uses Resend's batch endpoint: up to 100 emails per request. Returns how many were accepted.
 * Note: Resend's free tier allows 100 emails per day.
 */
export async function sendEmailBatch(to: string[], subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || to.length === 0) return { sent: 0 };
  const from = process.env.EMAIL_FROM || "Formtified <onboarding@resend.dev>";
  let sent = 0;
  for (let i = 0; i < to.length; i += 100) {
    const chunk = to.slice(i, i + 100);
    try {
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify(chunk.map((addr) => ({ from, to: [addr], subject, html }))),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) sent += chunk.length;
      else console.error("Batch email failed", res.status, await res.text().catch(() => ""));
    } catch (e) {
      console.error("Batch email error", e);
    }
  }
  return { sent };
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function appUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
