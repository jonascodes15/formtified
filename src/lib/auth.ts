import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { queryOne } from "./db";
import type { SessionUser } from "./types";

const COOKIE = "ft_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set and at least 32 characters. See README.md.");
  return new TextEncoder().encode(s);
}

/** `version` is the user's session_version. Resetting the password raises it, which ends every older session. */
export async function createSession(userId: number, version = 0) {
  const token = await new SignJWT({ uid: userId, v: version })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

async function readSession(): Promise<{ uid: number; v: number } | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.uid !== "number") return null;
    // Sessions made before session_version existed have no "v"; they count as version 0.
    return { uid: payload.uid, v: typeof payload.v === "number" ? payload.v : 0 };
  } catch {
    return null;
  }
}

/** Reads the signed-in user's id from the cookie, without a database query. */
export async function sessionUserId(): Promise<number | null> {
  return (await readSession())?.uid ?? null;
}

/** The signed-in user, including one who hasn't entered their email code yet (check `verified`). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await readSession();
  if (!session) return null;
  // A suspended user's session stops working straight away, and so does one from before a password reset.
  return queryOne<SessionUser>(
    `SELECT id, name, email, credits, plan, email_notifications, email_verified_at IS NOT NULL AS verified
     FROM users WHERE id = $1 AND suspended_at IS NULL AND session_version = $2`,
    [session.uid, session.v],
  );
}

/** The signed-in user, only once their email is verified. */
export async function getUser(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  return user?.verified ? user : null;
}

/** Admins are listed by email in ADMIN_EMAILS (comma-separated). */
export function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(email: string) {
  return adminEmails().includes(email.toLowerCase());
}

/** For admin pages: signed-out visitors go to /login; non-admins see a 404 so the area stays hidden. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isAdmin(user.email)) notFound();
  return user;
}

/** For admin API routes: null unless the caller is a signed-in admin. */
export async function apiAdmin(): Promise<SessionUser | null> {
  const user = await getUser();
  return user && isAdmin(user.email) ? user : null;
}

/** For pages: sends signed-out visitors to /login, and people who haven't entered their email code to /verify. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.verified) redirect("/verify");
  return user;
}

/** For API routes: returns null when signed out (or not yet verified) so the route can answer 401. */
export async function apiUser(): Promise<SessionUser | null> {
  return getUser();
}
