import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { TEMPLATES } from "@/lib/templates";

// Bump this when the homepage, templates or legal pages change, so search engines re-read them.
const UPDATED = new Date("2026-10-16");

/** The list of public pages search engines should know about (served at /sitemap.xml). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: base, lastModified: UPDATED, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/templates`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.9 },
    ...TEMPLATES.map((t) => ({ url: `${base}/templates/${t.key}`, lastModified: UPDATED, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${base}/signup`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/about`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/privacy`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.2 },
  ];
}
