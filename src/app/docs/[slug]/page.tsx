import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight, Mail } from "lucide-react";
import { PublicShell } from "@/components/landing/PublicShell";
import { JsonLd } from "@/components/JsonLd";
import { CONTACT_EMAIL, SHARE_IMAGE, siteUrl } from "@/lib/site";
import { DOCS, DOC_GROUPS, getDoc } from "../articles";

type Props = { params: Promise<{ slug: string }> };

// Help pages are built ahead of time; unknown addresses are a 404.
export const dynamicParams = false;
export function generateStaticParams() {
  return DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = getDoc((await params).slug);
  if (!doc) return {};
  return {
    title: `${doc.title} · Help`,
    description: doc.description,
    alternates: { canonical: `/docs/${doc.slug}` },
    openGraph: { type: "article", title: doc.title, description: doc.description, url: `/docs/${doc.slug}`, images: [SHARE_IMAGE] },
  };
}

export default async function DocPage({ params }: Props) {
  const doc = getDoc((await params).slug);
  if (!doc) notFound();

  const url = siteUrl();
  const i = DOCS.indexOf(doc);
  const prev = DOCS[i - 1];
  const next = DOCS[i + 1];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "TechArticle", headline: doc.title, description: doc.description, url: `${url}/docs/${doc.slug}`, publisher: { "@id": `${url}/#org` } },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Help Center", item: `${url}/docs` },
          { "@type": "ListItem", position: 2, name: doc.title, item: `${url}/docs/${doc.slug}` },
        ],
      },
    ],
  };

  return (
    <PublicShell>
      <JsonLd data={jsonLd} />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-8 sm:py-12 lg:grid-cols-[15rem_1fr]">
        {/* Every article, grouped; on phones it sits under the article. */}
        <nav aria-label="Help articles" className="order-2 lg:order-1 lg:sticky lg:top-6 lg:self-start">
          <Link href="/docs" className="text-sm font-semibold text-brand-700 hover:underline">Help Center</Link>
          {DOC_GROUPS.map((group) => (
            <div key={group} className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-soft">{group}</p>
              <ul className="mt-2 space-y-1">
                {DOCS.filter((d) => d.group === group).map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/docs/${d.slug}`}
                      aria-current={d.slug === doc.slug ? "page" : undefined}
                      className={`block rounded-xl px-3 py-1.5 text-sm ${d.slug === doc.slug ? "bg-brand-50 font-semibold text-brand-700" : "text-muted hover:bg-canvas hover:text-ink"}`}
                    >
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <article className="order-1 min-w-0 max-w-3xl lg:order-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted">
            <Link href="/docs" className="hover:text-ink">Help Center</Link>
            <ChevronRight className="size-3.5" />
            <span>{doc.group}</span>
          </nav>
          <h1 className="display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">{doc.title}</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-muted">{doc.description}</p>
          <div className="prose-docs mt-8">{doc.body}</div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`/docs/${prev.slug}`} className="card-hover rounded-2xl border border-line p-4">
                <span className="flex items-center gap-1 text-xs text-soft"><ArrowLeft className="size-3.5" /> Previous</span>
                <span className="mt-1 block font-medium">{prev.title}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/docs/${next.slug}`} className="card-hover rounded-2xl border border-line p-4 text-right">
                <span className="flex items-center justify-end gap-1 text-xs text-soft">Next <ArrowRight className="size-3.5" /></span>
                <span className="mt-1 block font-medium">{next.title}</span>
              </Link>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-3xl bg-canvas p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">Didn&apos;t find what you needed?</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="btn-ghost h-10 px-4 text-[13px]"><Mail className="size-4" /> Email {CONTACT_EMAIL}</a>
          </div>
        </article>
      </div>
    </PublicShell>
  );
}
