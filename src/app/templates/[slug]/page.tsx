import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ChevronRight, Clock, Lightbulb, ListChecks, Share2, SquarePen, UserRoundCheck } from "lucide-react";
import { PublicShell } from "@/components/landing/PublicShell";
import { JsonLd } from "@/components/JsonLd";
import { FormRenderer } from "@/components/form/FormRenderer";
import { siteUrl } from "@/lib/site";
import { TEMPLATES, getTemplate, minutesToFill, questionCount, templateFormFields, type Template } from "@/lib/templates";
import { FIELD_LABELS } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

// Every template page is built ahead of time; unknown addresses are a 404.
export const dynamicParams = false;
export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.key }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = getTemplate((await params).slug);
  if (!t) return {};
  return {
    title: `${t.seoTitle}: Free Template`,
    description: t.metaDescription,
    alternates: { canonical: `/templates/${t.key}` },
    openGraph: { type: "article", title: `${t.seoTitle} (free template)`, description: t.metaDescription, url: `/templates/${t.key}` },
  };
}

/** Sends visitors to sign up (or straight through, if signed in), then adds the template to their forms. */
const signupHref = (t: Template) => `/signup?next=${encodeURIComponent(`/new?template=${t.key}`)}`;

function faqs(t: Template): [string, string][] {
  return [
    [`Is this ${t.seoTitle.toLowerCase()} free?`, "Yes. Create a free Formtified account, add the template to your forms and share it. Templates don't use AI credits, and responses are unlimited."],
    ["Can I change the questions?", "Yes. Edit, reorder or remove any question, change the answer options (for example, to your own budget ranges) and add your own questions before you share it."],
    ["Does my client need an account to fill it?", "No. Your client opens the link, fills the form on any phone or computer and taps Submit. You get an in-app and email alert, and the answers land in your dashboard."],
    ["Can AI write a version for a specific project?", "Yes. Describe the project in a sentence and Formtified AI asks a few quick questions, then writes a questionnaire for that exact project. Each AI form uses one credit, and you get 20 free when you sign up."],
  ];
}

export default async function TemplatePage({ params }: Props) {
  const t = getTemplate((await params).slug);
  if (!t) notFound();

  const url = siteUrl();
  const count = questionCount(t);
  const related = TEMPLATES.filter((x) => x.category === t.category && x.key !== t.key).slice(0, 3);
  const qa = faqs(t);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: url },
          { "@type": "ListItem", position: 2, name: "Templates", item: `${url}/templates` },
          { "@type": "ListItem", position: 3, name: t.seoTitle, item: `${url}/templates/${t.key}` },
        ],
      },
      { "@type": "FAQPage", mainEntity: qa.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ],
  };

  // Number questions the way the form does (section headings aren't counted).
  let number = 0;

  return (
    <PublicShell>
      <JsonLd data={jsonLd} />

      <section className="bg-[#e8eeeb]">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-6 sm:pb-16 sm:pt-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted">
            <Link href="/templates" className="hover:text-ink">Templates</Link>
            <ChevronRight className="size-3.5" />
            <Link href={`/templates#${t.category.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}`} className="hover:text-ink">{t.category}</Link>
          </nav>
          <h1 className="display mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl">{t.seoTitle}</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted">{t.intro}</p>
          <ul className="mt-6 flex flex-wrap gap-2 text-sm">
            {[
              [ListChecks, `${count} questions`],
              [Clock, `About ${minutesToFill(t)} minutes for your client`],
              [UserRoundCheck, "No account needed to fill it"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof ListChecks;
              return (
                <li key={label as string} className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 font-medium">
                  <I className="size-4 text-brand-700" /> {label as string}
                </li>
              );
            })}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={signupHref(t)} className="btn-dark h-12 px-7">
              Use this template free <ArrowRight className="size-4" />
            </Link>
            <a href="#preview" className="btn h-12 border border-ink/15 bg-white px-7 text-ink hover:border-ink/30">
              Preview the form
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:py-20 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <h2 className="display text-3xl font-semibold">The {count} questions, and why each one matters</h2>
          <p className="mt-3 text-muted">Every question earns its place. Here&apos;s what each one tells you before you quote.</p>

          <ol className="mt-8 space-y-3">
            {t.fields.map((f) =>
              f.type === "section" ? (
                <li key={f.id} className="pt-6 first:pt-0">
                  <h3 className="display text-xl font-semibold text-brand-700">{f.label}</h3>
                </li>
              ) : (
                <li key={f.id} className="rounded-2xl border border-line p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">{++number}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-snug">
                        {f.label}
                        {f.required && <span className="ml-1 text-red-500" aria-label="required">*</span>}
                      </p>
                      <p className="mt-1 text-xs text-soft">{FIELD_LABELS[f.type]}</p>
                      {f.options && (
                        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Answer options">
                          {f.options.map((o) => (
                            <li key={o} className="rounded-full bg-canvas px-2.5 py-1 text-xs text-muted">{o}</li>
                          ))}
                        </ul>
                      )}
                      {f.why && (
                        <p className="mt-3 flex gap-2 text-sm leading-relaxed text-muted">
                          <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand" />
                          <span><span className="font-medium text-ink">Why ask: </span>{f.why}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ),
            )}
          </ol>

          <section className="mt-16">
            <h2 className="display text-3xl font-semibold">How to use this template</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                [Check, "Add it to your forms", "Create a free account. The template is copied into your dashboard, ready to share."],
                [SquarePen, "Make it yours", "Change the budget ranges to your prices, remove what you don't need and add your own questions."],
                [Share2, "Send one link", "Paste the link into WhatsApp, email or a DM. Answers arrive in your dashboard with an alert."],
              ].map(([Icon, title, body], i) => {
                const I = Icon as typeof Check;
                return (
                  <li key={title as string} className="rounded-3xl bg-canvas p-6">
                    <span className="flex items-center gap-2 text-sm font-semibold text-brand-700"><I className="size-4" /> Step {i + 1}</span>
                    <p className="mt-3 font-semibold">{title as string}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{body as string}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          <section id="preview" className="mt-16 scroll-mt-6">
            <h2 className="display text-3xl font-semibold">See it as your client will</h2>
            <p className="mt-3 text-muted">This is the form your client fills. Submitting is turned off in this preview.</p>
            <div className="mt-6 rounded-[2rem] bg-canvas p-3 sm:p-6">
              <div className="card p-6 sm:p-10">
                <FormRenderer title={t.title} description={t.description} fields={templateFormFields(t)} preview titleAs="h2" />
              </div>
            </div>
          </section>

          <section className="mt-16">
            <h2 className="display text-3xl font-semibold">Questions about this template</h2>
            <div className="mt-6 divide-y divide-line border-y border-line">
              {qa.map(([q, a]) => (
                <details key={q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {q}
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-canvas text-xl transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted">{a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-3xl bg-forest p-6 text-white">
            <p className="display text-2xl font-semibold leading-tight">Send this to your next client</p>
            <ul className="mt-5 space-y-2.5 text-sm text-white/80">
              {["Free, no credits needed", "Edit every question", "Clients fill it on any phone", "Alerts when they submit", "Export answers to Excel"].map((x) => (
                <li key={x} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-lime" /> {x}</li>
              ))}
            </ul>
            <Link href={signupHref(t)} className="btn mt-6 h-12 w-full bg-lime text-forest hover:bg-white">
              Use this template <ArrowRight className="size-4" />
            </Link>
          </div>
          {related.length > 0 && (
            <div className="mt-5 rounded-3xl border border-line p-6">
              <p className="text-sm font-semibold">More {t.category.toLowerCase()} templates</p>
              <ul className="mt-3 space-y-2.5 text-sm">
                {related.map((r) => (
                  <li key={r.key}>
                    <Link href={`/templates/${r.key}`} className="text-muted hover:text-ink hover:underline">{r.seoTitle}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/templates" className="font-medium text-brand-700 hover:underline">All {TEMPLATES.length} templates →</Link>
                </li>
              </ul>
            </div>
          )}
        </aside>
      </div>
    </PublicShell>
  );
}
