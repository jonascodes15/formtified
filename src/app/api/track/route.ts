import { after } from "next/server";
import { sessionUserId } from "@/lib/auth";
import { browserOf, cleanReferrer, deviceOf, isBot, recordPageView, visitorHash } from "@/lib/analytics";

/** Receives one page view from the browser (see src/components/VisitTracker.tsx). */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  const body = (await req.json().catch(() => null)) as { path?: unknown; referrer?: unknown } | null;
  const path = typeof body?.path === "string" ? body.path : "";

  // Ignore bots, junk, and pages we don't want to count.
  if (isBot(ua) || !/^\/[^\s?#]{0,299}$/.test(path) || path.startsWith("/admin") || path.startsWith("/api")) {
    return new Response(null, { status: 204 });
  }

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "0.0.0.0";
  const country = req.headers.get("x-vercel-ip-country"); // set by Vercel; empty when running locally
  const userId = await sessionUserId();
  const view = {
    path,
    referrer: cleanReferrer(body?.referrer, req.headers.get("host")),
    visitor: visitorHash(ip, ua),
    userId,
    country: country && /^[A-Z]{2}$/.test(country) ? country : null,
    device: deviceOf(ua),
    browser: browserOf(ua),
  };

  // Save after the response is sent, so tracking never slows a page down.
  after(() => recordPageView(view).catch((e) => console.error("page view not saved", e)));
  return new Response(null, { status: 204 });
}
