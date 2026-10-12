import "server-only";
import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { execute, queryOne } from "./db";
import { appUrl, resetPasswordEmail, sendEmail, verifyCodeEmail } from "./email";

/**
 * Signup codes and password-reset links (the auth_tokens table).
 * Only an HMAC of each code or link is stored, so a leaked database can't be used to sign in.
 */

const CODE_MINUTES = 15;
const RESET_MINUTES = 60;
const MAX_CODE_TRIES = 5; // wrong guesses allowed per code
const RESEND_COOLDOWN_SECONDS = 45;
const MAX_CODES_PER_HOUR = 5;
const MAX_RESETS_PER_HOUR = 3;

type Purpose = "verify" | "reset";

function hash(value: string) {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set. See README.md.");
  return createHmac("sha256", s).update(value).digest("hex");
}

async function recentSends(userId: number, purpose: Purpose) {
  const row = await queryOne<{ hour: string; last_seconds: number | null }>(
    `SELECT COUNT(*) FILTER (WHERE created_at > now() - interval '1 hour') AS hour,
            EXTRACT(EPOCH FROM now() - MAX(created_at))::int AS last_seconds
     FROM auth_tokens WHERE user_id = $1 AND purpose = $2`,
    [userId, purpose],
  );
  return { hour: Number(row?.hour ?? 0), lastSeconds: row?.last_seconds ?? null };
}

async function store(userId: number, purpose: Purpose, secret: string, minutes: number) {
  // Old rows are only needed for the hourly limit, so clear out anything older than a day.
  await execute("DELETE FROM auth_tokens WHERE created_at < now() - interval '1 day'");
  await execute(
    `INSERT INTO auth_tokens (user_id, purpose, token_hash, expires_at)
     VALUES ($1, $2, $3, now() + make_interval(mins => $4::int))`,
    [userId, purpose, hash(secret), minutes],
  );
}

export type SendResult = { ok: true } | { ok: false; error: string; status: number };

/** Emails a new 6-digit signup code. Rate limited: one every 45 seconds, five an hour. */
export async function sendVerifyCode(user: { id: number; name: string; email: string }): Promise<SendResult> {
  const sends = await recentSends(user.id, "verify");
  if (sends.lastSeconds !== null && sends.lastSeconds < RESEND_COOLDOWN_SECONDS) {
    return { ok: false, error: `Please wait ${RESEND_COOLDOWN_SECONDS - sends.lastSeconds} seconds before asking for another code.`, status: 429 };
  }
  if (sends.hour >= MAX_CODES_PER_HOUR) {
    return { ok: false, error: "Too many codes requested. Please try again in an hour.", status: 429 };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await store(user.id, "verify", code, CODE_MINUTES);

  const mail = verifyCodeEmail(user.name, code);
  const result = await sendEmail(user.email, mail.subject, mail.html);
  if ("skipped" in result && process.env.NODE_ENV !== "production") {
    console.info(`[dev] Email code for ${user.email}: ${code}`);
    return { ok: true };
  }
  if (!("sent" in result) || !result.sent) {
    return { ok: false, error: "We couldn't send the email just now. Please try again in a minute.", status: 502 };
  }
  return { ok: true };
}

/** True when the user already has a code that can still be used, so logging in doesn't need to send another. */
export async function hasLiveVerifyCode(userId: number) {
  const row = await queryOne(
    `SELECT 1 FROM auth_tokens
     WHERE user_id = $1 AND purpose = 'verify' AND used_at IS NULL AND expires_at > now() AND attempts < $2
     LIMIT 1`,
    [userId, MAX_CODE_TRIES],
  );
  return Boolean(row);
}

export type CodeCheck = { ok: true } | { ok: false; error: string };

/** Checks a typed code against the newest one sent. On success the email is marked verified. */
export async function checkVerifyCode(userId: number, code: string): Promise<CodeCheck> {
  const latest = await queryOne<{ id: number; token_hash: string; expired: boolean }>(
    `SELECT id, token_hash, expires_at <= now() AS expired FROM auth_tokens
     WHERE user_id = $1 AND purpose = 'verify' AND used_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
    [userId],
  );
  if (!latest) return { ok: false, error: "This code has expired. Tap “Send a new code”." };
  if (latest.expired) return { ok: false, error: "This code has expired. Tap “Send a new code”." };

  // Count the try before comparing, in one step, so guesses sent at the same time still hit the limit.
  const counted = await queryOne<{ attempts: number }>(
    "UPDATE auth_tokens SET attempts = attempts + 1 WHERE id = $1 AND attempts < $2 RETURNING attempts",
    [latest.id, MAX_CODE_TRIES],
  );
  if (!counted) return { ok: false, error: "Too many wrong tries. Tap “Send a new code” to get a fresh one." };

  const a = Buffer.from(hash(code));
  const b = Buffer.from(latest.token_hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    const left = MAX_CODE_TRIES - counted.attempts;
    return {
      ok: false,
      error: left > 0
        ? `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.`
        : "Too many wrong tries. Tap “Send a new code” to get a fresh one.",
    };
  }

  await execute("UPDATE users SET email_verified_at = now() WHERE id = $1 AND email_verified_at IS NULL", [userId]);
  await execute("UPDATE auth_tokens SET used_at = now() WHERE user_id = $1 AND purpose = 'verify' AND used_at IS NULL", [userId]);
  return { ok: true };
}

/**
 * Emails a password-reset link if the address belongs to an active account.
 * Says nothing about whether the account exists, so nobody can use it to find out who has signed up.
 */
export async function sendResetLink(email: string) {
  const user = await queryOne<{ id: number; name: string; email: string }>(
    "SELECT id, name, email FROM users WHERE email = $1 AND suspended_at IS NULL",
    [email],
  );
  if (!user) return;
  const sends = await recentSends(user.id, "reset");
  if (sends.hour >= MAX_RESETS_PER_HOUR) return;
  if (sends.lastSeconds !== null && sends.lastSeconds < RESEND_COOLDOWN_SECONDS) return;

  const token = randomBytes(32).toString("base64url");
  await store(user.id, "reset", token, RESET_MINUTES);
  const mail = resetPasswordEmail(user.name, `${appUrl()}/reset-password?token=${token}`);
  const result = await sendEmail(user.email, mail.subject, mail.html);
  if ("skipped" in result && process.env.NODE_ENV !== "production") {
    console.info(`[dev] Reset link for ${user.email}: ${appUrl()}/reset-password?token=${token}`);
  }
}

/** Looks up a reset link without using it up (for showing the page). */
export async function peekResetToken(token: string) {
  if (!token || token.length > 100) return null;
  return queryOne<{ user_id: number }>(
    `SELECT user_id FROM auth_tokens
     WHERE token_hash = $1 AND purpose = 'reset' AND used_at IS NULL AND expires_at > now()`,
    [hash(token)],
  );
}

/** Uses up a reset link (it only ever works once) and returns whose it was, or null if it's invalid or expired. */
export async function consumeResetToken(token: string) {
  if (!token || token.length > 100) return null;
  const row = await queryOne<{ user_id: number }>(
    `UPDATE auth_tokens SET used_at = now()
     WHERE token_hash = $1 AND purpose = 'reset' AND used_at IS NULL AND expires_at > now()
     RETURNING user_id`,
    [hash(token)],
  );
  if (!row) return null;
  // Any other reset links sent to this person stop working too.
  await execute("UPDATE auth_tokens SET used_at = now() WHERE user_id = $1 AND purpose = 'reset' AND used_at IS NULL", [row.user_id]);
  return row.user_id;
}
