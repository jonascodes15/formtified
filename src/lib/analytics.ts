import "server-only";
import crypto from "node:crypto";
import { execute } from "./db";

/**
 * Privacy-friendly page view tracking (no cookies, no third-party service).
 * A visitor is identified by a hash of (today's date + IP + browser + AUTH_SECRET).
 * The hash changes every day and cannot be turned back into an IP address,
 * so we can count unique visitors per day without storing personal data.
 */

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|node-fetch|go-http/i;

export function isBot(ua: string) {
  return !ua || BOT.test(ua);
}

export function deviceOf(ua: string): "mobile" | "tablet" | "desktop" {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return "mobile";
  return "desktop";
}

export function browserOf(ua: string) {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/SamsungBrowser/.test(ua)) return "Samsung";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}

export function visitorHash(ip: string, ua: string) {
  const day = new Date().toISOString().slice(0, 10);
  return crypto
    .createHash("sha256")
    .update(`${day}|${ip}|${ua}|${process.env.AUTH_SECRET || ""}`)
    .digest("hex")
    .slice(0, 32);
}

/** Keeps only the referring site's domain, and drops referrers from our own site. */
export function cleanReferrer(referrer: unknown, ownHost: string | null) {
  if (typeof referrer !== "string" || !referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (!host || (ownHost && host === ownHost.replace(/^www\./, "").split(":")[0])) return null;
    return host.slice(0, 200);
  } catch {
    return null;
  }
}

export async function recordPageView(v: {
  path: string;
  referrer: string | null;
  visitor: string;
  userId: number | null;
  country: string | null;
  device: string;
  browser: string;
}) {
  await execute(
    `INSERT INTO page_views (path, referrer, visitor, user_id, country, device, browser)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [v.path, v.referrer, v.visitor, v.userId, v.country, v.device, v.browser],
  );
  if (v.userId) {
    // Powers "active users". Written at most once every 5 minutes per user.
    await execute(
      `UPDATE users SET last_seen_at = now()
       WHERE id = $1 AND (last_seen_at IS NULL OR last_seen_at < now() - interval '5 minutes')`,
      [v.userId],
    );
  }
}
