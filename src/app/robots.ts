import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Tells search engines what to crawl. Signed-in areas are private, so they're kept out. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/dashboard", "/forms/", "/new", "/generate", "/responses", "/account", "/credits", "/verify", "/reset-password", "/brief/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
