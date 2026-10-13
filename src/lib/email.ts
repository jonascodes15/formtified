import "server-only";
import { siteUrl } from "./site";

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

/** Account emails (codes and password links) need Resend. Without it, signup skips the email check. */
export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY);
}

const firstName = (name: string) => escapeHtml(name.trim().split(/\s+/)[0] || "there");

function accountEmail(body: string) {
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#10231a;max-width:480px">
    ${body}
    <p style="color:#6b7a70;font-size:13px;margin-top:28px">Formtified · AI onboarding forms for creators</p>
  </div>`;
}

export function verifyCodeEmail(name: string, code: string) {
  return {
    subject: `${code} is your Formtified code`,
    html: accountEmail(`
      <p>Hi ${firstName(name)},</p>
      <p>Enter this code to confirm your email and finish creating your Formtified account:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:20px 0;color:#10231a">${code}</p>
      <p style="color:#6b7a70;font-size:13px">The code expires in 15 minutes. If you didn't sign up for Formtified, you can ignore this email.</p>
    `),
  };
}

export function resetPasswordEmail(name: string, link: string) {
  return {
    subject: "Reset your Formtified password",
    html: accountEmail(`
      <p>Hi ${firstName(name)},</p>
      <p>Someone asked to reset the password for your Formtified account. If that was you, choose a new password here:</p>
      <p><a href="${link}" style="background:#4ba256;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;display:inline-block">Choose a new password</a></p>
      <p style="color:#6b7a70;font-size:13px">The link works once and expires in 1 hour. If you didn't ask for this, ignore this email and your password stays the same.</p>
    `),
  };
}

export function passwordChangedEmail(name: string) {
  return {
    subject: "Your Formtified password was changed",
    html: accountEmail(`
      <p>Hi ${firstName(name)},</p>
      <p>Your Formtified password was just changed, and you were signed out on your other devices.</p>
      <p>If this wasn't you, reset your password straight away at <a href="${appUrl()}/forgot-password" style="color:#2f7a3c">${appUrl()}/forgot-password</a>.</p>
    `),
  };
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export const appUrl = siteUrl;
