/** Site-wide facts used by metadata, the sitemap, structured data and legal pages. */

export const SITE_NAME = "Formtified";
export const SITE_TAGLINE = "Client onboarding forms for freelancers & agencies";
export const SITE_DESCRIPTION =
  "Create client onboarding forms and project questionnaires in seconds with AI or free templates. Share one link on WhatsApp or email and get every answer in one dashboard.";

/** The company that builds and runs Formtified. Shown in the footer, legal pages and About page. */
export const COMPANY = {
  name: "Weblanda Technologies Ltd",
  rc: "RC 9902017",
  location: "Lagos, Nigeria",
  url: "https://weblanda.com",
} as const;

export const FOUNDER = {
  name: "Jonas Chukwuemeka",
  role: "Founder",
  portfolio: "https://jonaschukwuemeka.com",
  linkedin: "https://www.linkedin.com/in/jonas-chukwuemeka/",
} as const;

/** Where people can reach the team. Set CONTACT_EMAIL to use a different inbox. */
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "support@weblanda.com";

/** The app's public address (server only: APP_URL isn't sent to the browser). */
export function siteUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

/**
 * A "?next=" address is only followed if it's a path on this site,
 * so a link can't send someone to another website after they sign in.
 */
export function safeNext(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  return value.slice(0, 300);
}
