import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Globe, MessageCircle, ShieldCheck, Target } from "lucide-react";
import { PublicShell } from "@/components/landing/PublicShell";
import { JsonLd } from "@/components/JsonLd";
import { COMPANY, CONTACT_EMAIL, FOUNDER, SHARE_IMAGE, SITE_NAME, siteUrl } from "@/lib/site";
import founderPhoto from "./founder.jpg";

const DESCRIPTION = `Formtified is built by ${COMPANY.name} in ${COMPANY.location}. Meet the team behind the client onboarding forms for freelancers and agencies.`;

export const metadata: Metadata = {
  title: "About Us",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { title: "About Formtified", description: DESCRIPTION, url: "/about", images: [SHARE_IMAGE] },
};

const BELIEFS = [
  [Target, "Clear briefs before quotes", "Most project trouble starts with a vague brief. The right questions up front save weeks of back-and-forth and stop you from under-quoting."],
  [MessageCircle, "Built for how you work", "Your clients live on WhatsApp and their phones. Formtified forms are one link, open on any phone, and need no account to fill."],
  [ShieldCheck, "Your data is yours", "Your forms and your clients' answers belong to you. We don't sell data or use it for advertising, and you can delete it any time."],
] as const;

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export default function AboutPage() {
  const url = siteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${url}/about`,
    name: "About Formtified",
    description: DESCRIPTION,
    mainEntity: {
      "@type": "Organization",
      "@id": `${url}/#org`,
      name: SITE_NAME,
      url,
      email: CONTACT_EMAIL,
      parentOrganization: { "@type": "Organization", name: COMPANY.name, legalName: COMPANY.name, url: COMPANY.url, address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" } },
      founder: { "@type": "Person", name: FOUNDER.name, jobTitle: FOUNDER.role, url: FOUNDER.portfolio, sameAs: [FOUNDER.portfolio, FOUNDER.linkedin] },
    },
  };

  return (
    <PublicShell>
      <JsonLd data={jsonLd} />

      <section className="bg-[#e8eeeb]">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-8 sm:pb-20 sm:pt-12">
          <p className="text-sm font-semibold text-brand-700">About us</p>
          <h1 className="display mt-3 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl">Helping freelancers know exactly what clients want</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted">
            Formtified turns the endless &ldquo;so what do you need?&rdquo; chat into one link. Your client answers the right questions on their phone, and you
            get a clear brief before you quote.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <section className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <h2 className="display text-3xl font-semibold leading-tight sm:text-4xl">Why we built Formtified</h2>
          <div className="space-y-4 text-[17px] leading-relaxed text-muted">
            <p>
              Every freelancer knows the routine. A new client sends a voice note, a few screenshots and &ldquo;something like this, but better&rdquo;. You ask
              questions one at a time over WhatsApp, the answers get lost in the chat, and you quote with half the picture.
            </p>
            <p>
              Big agencies fix this with long intake forms and onboarding calls. Formtified gives the same process to designers, developers, photographers,
              planners and every small business that works with clients: a form written for the project in seconds, shared as one link, with every answer
              in one place.
            </p>
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <h2 className="display text-3xl font-semibold">What we believe</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {BELIEFS.map(([Icon, title, body]) => (
              <li key={title} className="rounded-3xl bg-canvas p-6">
                <span className="grid size-10 place-items-center rounded-2xl bg-white text-brand-700"><Icon className="size-5" /></span>
                <p className="mt-4 font-semibold">{title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 sm:mt-24" aria-labelledby="founder">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
            <span className="size-2 rounded-full bg-brand ring-4 ring-brand-50" /> The founder
          </p>
          <div className="mt-5 flex flex-col gap-8 rounded-3xl border border-line p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:p-10">
            <Image
              src={founderPhoto}
              alt={`Portrait of ${FOUNDER.name}`}
              placeholder="blur"
              sizes="192px"
              className="size-36 shrink-0 rounded-full object-cover object-[50%_25%] ring-[6px] ring-brand-50 sm:size-48"
            />
            <div className="min-w-0">
              <h3 id="founder" className="display text-3xl font-semibold">{FOUNDER.name}</h3>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">{FOUNDER.role}</p>
              <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">
                Jonas is a Lagos-based software and data engineer. He studied Biology at FUTO, taught himself to build software, and started Weblanda to give
                small businesses the tools bigger brands take for granted. Formtified comes from the same idea: a proper client onboarding process for every
                freelancer, not just big agencies.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={FOUNDER.portfolio} target="_blank" rel="noopener" className="btn-dark h-11 px-5">
                  <Globe className="size-4" /> View portfolio
                </a>
                <a href={FOUNDER.linkedin} target="_blank" rel="noopener" className="btn h-11 border border-line bg-white px-5 text-ink hover:border-ink/30">
                  <LinkedInIcon className="size-4" /> LinkedIn
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:mt-24 md:grid-cols-2">
          <div className="rounded-3xl bg-canvas p-6 sm:p-8">
            <span className="grid size-10 place-items-center rounded-2xl bg-white text-brand-700"><Building2 className="size-5" /></span>
            <h2 className="display mt-4 text-2xl font-semibold">The company</h2>
            <p className="mt-2 leading-relaxed text-muted">
              Formtified is a product of {COMPANY.name}, a software company registered in Nigeria ({COMPANY.rc}) and based in {COMPANY.location}.
            </p>
            <p className="mt-3 leading-relaxed text-muted">
              Questions, feedback or a feature you&apos;d like? Email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-brand-700 underline">{CONTACT_EMAIL}</a>.
            </p>
          </div>
          <div className="flex flex-col justify-between rounded-3xl bg-forest p-6 text-white sm:p-8">
            <div>
              <h2 className="display text-2xl font-semibold">Send your next client one link</h2>
              <p className="mt-2 leading-relaxed text-white/75">Start from a free template or let AI write a form for your project. Free to start, no card needed.</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn h-12 bg-lime px-6 text-forest hover:bg-white">
                Create a free account <ArrowRight className="size-4" />
              </Link>
              <Link href="/templates" className="btn h-12 border border-white/25 px-6 text-white hover:border-white/60">
                Browse templates
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
