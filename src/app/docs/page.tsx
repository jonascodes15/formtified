import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CreditCard, Inbox, Rocket, Send, Wrench } from "lucide-react";
import { PublicShell } from "@/components/landing/PublicShell";
import { JsonLd } from "@/components/JsonLd";
import { CONTACT_EMAIL, siteUrl } from "@/lib/site";
import { DOCS, DOC_GROUPS } from "./articles";

const DESCRIPTION = "How to create client onboarding forms with AI or templates, share them on WhatsApp, collect files, summarise responses and manage credits.";

export const metadata: Metadata = {
  title: "Help Center",
  description: DESCRIPTION,
  alternates: { canonical: "/docs" },
  openGraph: { title: "Formtified Help Center", description: DESCRIPTION, url: "/docs" },
};

const ICONS = { "Getting started": Rocket, "Building forms": Wrench, Sharing: Send, Responses: Inbox, "Account and credits": CreditCard } as const;

export default function DocsIndex() {
  const url = siteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Formtified Help Center",
    description: DESCRIPTION,
    url: `${url}/docs`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: DOCS.map((d, i) => ({ "@type": "ListItem", position: i + 1, url: `${url}/docs/${d.slug}`, name: d.title })),
    },
  };

  return (
    <PublicShell>
      <JsonLd data={jsonLd} />
      <section className="bg-[#e8eeeb]">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-8 sm:pb-16 sm:pt-12">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-700"><BookOpen className="size-4" /> Help Center</p>
          <h1 className="display mt-3 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl">How can we help?</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted">
            Short guides to everything in Formtified, from your first form to reading your client&apos;s brief. New here? Start with{" "}
            <Link href="/docs/getting-started" className="font-medium text-brand-700 underline">Get started</Link>.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-5 px-5 py-14 sm:grid-cols-2 sm:py-20 lg:grid-cols-3">
        {DOC_GROUPS.map((group) => {
          const Icon = ICONS[group];
          return (
            <section key={group} className="rounded-3xl border border-line p-6">
              <h2 className="flex items-center gap-2.5 font-semibold">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-4" /></span>
                {group}
              </h2>
              <ul className="mt-4 space-y-3">
                {DOCS.filter((d) => d.group === group).map((d) => (
                  <li key={d.slug}>
                    <Link href={`/docs/${d.slug}`} className="group block">
                      <span className="flex items-center gap-1 font-medium group-hover:text-brand-700 group-hover:underline">
                        {d.title} <ArrowRight className="size-3.5 opacity-0 transition group-hover:opacity-100" />
                      </span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-muted">{d.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <section className="flex flex-col justify-between rounded-3xl bg-forest p-6 text-white">
          <div>
            <h2 className="font-semibold">Still stuck?</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">Email us with what you were trying to do, and a real person will help.</p>
          </div>
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn mt-6 h-11 bg-lime text-forest hover:bg-white">{CONTACT_EMAIL}</a>
        </section>
      </div>
    </PublicShell>
  );
}
