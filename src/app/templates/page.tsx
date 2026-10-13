import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, ListChecks, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/landing/PublicShell";
import { JsonLd } from "@/components/JsonLd";
import { siteUrl } from "@/lib/site";
import { CATEGORIES, TEMPLATES, minutesToFill, questionCount } from "@/lib/templates";

const DESCRIPTION = `${TEMPLATES.length} free client questionnaire and onboarding form templates for freelancers and agencies: websites, apps, logos, branding, social media, photography, events and more.`;

export const metadata: Metadata = {
  title: "Free Client Questionnaire & Onboarding Form Templates",
  description: DESCRIPTION,
  alternates: { canonical: "/templates" },
  openGraph: { title: "Free client questionnaire templates", description: DESCRIPTION, url: "/templates" },
};

const slug = (c: string) => c.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

export default function TemplatesIndexPage() {
  const url = siteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Free client questionnaire templates",
        description: DESCRIPTION,
        url: `${url}/templates`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: TEMPLATES.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: `${url}/templates/${t.key}`, name: t.seoTitle })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: url },
          { "@type": "ListItem", position: 2, name: "Templates", item: `${url}/templates` },
        ],
      },
    ],
  };

  return (
    <PublicShell>
      <JsonLd data={jsonLd} />
      <section className="bg-[#e8eeeb]">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-8 sm:pb-20 sm:pt-12">
          <p className="text-sm font-semibold text-brand-700">Templates</p>
          <h1 className="display mt-3 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl">Free client questionnaire templates</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted">
            {TEMPLATES.length} onboarding forms and project briefs for freelancers and agencies. Each one explains why every question matters. Use any template free, edit it, and send it to your client as one link.
          </p>
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Template categories">
            {CATEGORIES.map((c) => (
              <a key={c} href={`#${slug(c)}`} className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-medium hover:border-ink/30">
                {c}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        {CATEGORIES.map((c) => (
          <section key={c} id={slug(c)} className="scroll-mt-6 [&+&]:mt-16">
            <h2 className="display text-2xl font-semibold sm:text-3xl">{c}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.filter((t) => t.category === c).map((t) => (
                <Link key={t.key} href={`/templates/${t.key}`} className="card-hover group flex flex-col rounded-3xl border border-line bg-white p-6">
                  <span className="text-lg font-semibold leading-snug group-hover:underline">{t.seoTitle}</span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">{t.summary}</span>
                  <span className="mt-5 flex items-center gap-4 text-xs text-soft">
                    <span className="flex items-center gap-1.5"><ListChecks className="size-3.5" /> {questionCount(t)} questions</span>
                    <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> ~{minutesToFill(t)} min to fill</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-20 flex flex-col items-start gap-6 rounded-[2rem] bg-forest p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <div>
            <Sparkles className="size-6 text-lime" />
            <h2 className="display mt-4 text-3xl font-semibold leading-tight">Can&apos;t find your kind of project?</h2>
            <p className="mt-2 max-w-xl text-white/70">Describe it in one sentence. Formtified AI asks a few questions, then writes a questionnaire for that exact project.</p>
          </div>
          <Link href={`/signup?next=${encodeURIComponent("/generate")}`} className="btn h-12 shrink-0 bg-lime px-7 text-forest hover:bg-white">
            Write one with AI <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </PublicShell>
  );
}
