import Link from "next/link";
import {
  AlertTriangle, ArrowRight, Check, ClipboardList, Download, Bell, FileDown, HelpCircle, LayoutTemplate, MessageSquareText, Paperclip, Share2, Sparkles,
  Wallet, Wand2, Inbox, FileText, Search,
} from "lucide-react";
import { FIELD_TYPES } from "@/lib/types";
import { UPLOAD_MAX_FILES, UPLOAD_MAX_MB } from "@/lib/files";
import { FORM_COST, PACKS, SUMMARY_COST, naira } from "@/lib/credits";
import { LogoMark, Wordmark } from "@/components/Logo";
import { LandingNav } from "@/components/landing/LandingNav";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { MockFormCard, MockResponseCard, MockChatCard } from "@/components/landing/Mocks";
import { getUser } from "@/lib/auth";
import { COMPANY, CONTACT_EMAIL, FOUNDER, SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";
import { TEMPLATES, questionCount } from "@/lib/templates";

export const metadata = {
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, title: "Formtified: client onboarding forms for freelancers", description: SITE_DESCRIPTION, url: "/" },
};

const FAQS: [string, string][] = [
  ["Is Formtified free?", "Yes. Templates, editing, sharing, file uploads and unlimited responses are free. You also get 20 AI credits when you sign up: one credit writes a form with AI, and one credit turns a response into an AI brief."],
  ["Does my client need an account?", "No. They open the link, fill the form and submit. Only you need an account."],
  ["Can I send the form on WhatsApp?", "Yes. Copy your form's link and paste it into any chat. The link shows a preview with your form's title, and your client fills it on their phone."],
  ["How is Formtified different from Google Forms?", "Google Forms is a general tool for surveys and quizzes, and you start from a blank page. Formtified is built for client briefs: the AI writes the questions for your project, the templates are made for client work, and each response arrives as a readable brief with an alert."],
  ["Can I edit the form the AI makes?", "Yes. Change any question, add or remove questions, reorder them and change question types before or after sharing."],
  ["Can clients send me files?", `Yes. Add a File upload question and clients can attach logos, photos, documents, audio and video, up to ${UPLOAD_MAX_FILES} files of ${UPLOAD_MAX_MB} MB each per question. They don't need an account, and only you can open the files.`],
  ["What is the AI brief?", "One tap turns a client's response into a one-page brief: an overview, scope, budget, timeline, risks and the questions to ask before you quote. You can send the questions on WhatsApp or download the brief as a PDF."],
  ["What happens when I run out of credits?", "You can still use templates, build forms by hand, edit forms and collect unlimited responses. To use AI again, buy a credit pack in Naira with card, bank transfer or USSD through Paystack."],
  ["Who is Formtified for?", "Web and app developers, designers, video editors, photographers, social media managers, event planners and any freelancer or agency that needs a clear brief from clients."],
];

// Shown on the homepage; the full list is at /templates.
const FEATURED = [
  "website-design-client-questionnaire",
  "logo-design-questionnaire",
  "mobile-app-development-questionnaire",
  "social-media-client-onboarding-questionnaire",
  "graphic-design-brief",
  "wedding-photography-questionnaire",
  "event-planning-client-questionnaire",
  "freelance-client-intake-form",
];

function structuredData() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#org`,
        name: SITE_NAME,
        url,
        logo: `${url}/icon.svg`,
        email: CONTACT_EMAIL,
        parentOrganization: { "@type": "Organization", name: COMPANY.name, legalName: COMPANY.name, url: COMPANY.url },
        founder: { "@type": "Person", name: FOUNDER.name, url: FOUNDER.portfolio, sameAs: [FOUNDER.portfolio, FOUNDER.linkedin] },
      },
      { "@type": "WebSite", "@id": `${url}/#website`, name: SITE_NAME, url, publisher: { "@id": `${url}/#org` } },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: SITE_DESCRIPTION,
        offers: [
          { "@type": "Offer", name: "Free", price: "0", priceCurrency: "NGN" },
          ...PACKS.map((p) => ({ "@type": "Offer", name: `${p.name}: ${p.credits} AI credits`, price: String(p.naira), priceCurrency: "NGN" })),
        ],
        publisher: { "@id": `${url}/#org` },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
  };
}

export default async function Home() {
  const user = await getUser().catch(() => null);
  const featured = FEATURED.map((k) => TEMPLATES.find((t) => t.key === k)!).filter(Boolean);

  return (
    <div className="bg-white">
      <JsonLd data={structuredData()} />
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#e8eeeb]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.8),transparent_60%)]" />
        <LandingNav signedIn={Boolean(user)} />
        <div className="relative mx-auto max-w-6xl px-5 pt-14 sm:pt-20 text-center">
          {/* The hero rises in piece by piece when the page loads */}
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm animate-rise">
            Client onboarding forms for freelancers &amp; agencies
          </span>
          <h1 className="display mx-auto mt-6 max-w-4xl text-[2.6rem] leading-[1.05] font-semibold text-ink sm:text-6xl lg:text-7xl animate-rise" style={{ "--i": 1 } as React.CSSProperties}>
            Know exactly what your client wants to build.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-lg animate-rise" style={{ "--i": 3 } as React.CSSProperties}>
            Formtified writes your client questionnaire with AI, or you start from a free template. Share one link on WhatsApp or email, and every answer lands in your dashboard, ready to quote.
          </p>
          <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center animate-rise" style={{ "--i": 5 } as React.CSSProperties}>
            <Link href={user ? "/generate" : "/signup"} className="btn-dark h-12 px-7">
              Get Started <ArrowRight className="size-4" />
            </Link>
            <Link href="/templates" className="btn h-12 border border-ink/15 bg-white px-7 text-ink hover:border-ink/30 hover:bg-white/70">
              Browse free templates
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted animate-rise" style={{ "--i": 6 } as React.CSSProperties}>Free to start · no card needed</p>

          {/* Product mock: rises in, then grows to full size as you scroll into it */}
          <div className="relative mx-auto mt-14 max-w-5xl animate-rise" style={{ "--i": 8 } as React.CSSProperties}>
            <div className="scroll-zoom rounded-t-[1.75rem] border-[10px] border-b-0 border-ink bg-ink">
              <DashboardMock />
            </div>
            <div className="absolute -right-2 top-10 hidden w-64 md:block lg:-right-10">
              <div className="animate-float"><MockResponseCard /></div>
            </div>
            <div className="absolute -left-2 top-40 hidden w-64 -rotate-2 lg:block lg:-left-12">
              <div className="animate-float" style={{ animationDelay: "-3s" }}><MockChatCard /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <Reveal>
          <h2 className="display mx-auto max-w-2xl text-center text-4xl sm:text-5xl font-semibold leading-tight">Onboarding that gets the full picture</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted">
            No more voice notes, scattered chats and forgotten features. One link collects everything before you quote or start work.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: Wand2, tint: "bg-lime", title: "AI-built forms", body: "Describe the project in a sentence. The AI asks up to 4 quick questions, then writes the whole form in seconds." },
            { icon: Share2, tint: "bg-[#e3dbf7]", title: "Share one link", body: "Send it on WhatsApp, email or DM. Clients fill it on any phone, no account needed." },
            { icon: Inbox, tint: "bg-[#efe6d2]", title: "Answers in your account", body: "Every response lands in your dashboard with an in-app and email alert. Export to CSV any time." },
            { icon: Paperclip, tint: "bg-[#d9ecf2]", title: "Clients attach files", body: `Logos, photos, documents and voice notes come in with the answers. Up to ${UPLOAD_MAX_FILES} files per question, private to you.` },
            { icon: ClipboardList, tint: "bg-lime", title: "AI brief of every response", body: "Turn a long response into one page: goals, scope, budget, timeline, risks and what to ask before you quote." },
            { icon: Wallet, tint: "bg-[#e3dbf7]", title: "Pay in Naira", body: "Free to start. Top up AI credits with card, bank transfer or USSD through Paystack. Credits never expire." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 110}>
              <div className="card-hover h-full rounded-3xl border border-line bg-canvas/60 p-7">
                <span className={`grid size-12 place-items-center rounded-2xl ${f.tint}`}><f.icon className="size-5 text-ink" /></span>
                <h3 className="mt-6 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Dark band */}
      <section className="bg-forest text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2">
          <Reveal from="left" className="relative mx-auto w-full max-w-sm">
            <div className="rounded-[2.5rem] border-[10px] border-[#0a1f15] bg-canvas p-4 shadow-2xl">
              <div className="rounded-2xl bg-forest px-4 pb-10 pt-4 text-[11px] text-white/80">Sent by Tolu Designs</div>
              <div className="-mt-7"><MockFormCard /></div>
              <div className="mt-3 h-10 rounded-full bg-brand text-center text-sm leading-10 font-semibold text-white">Submit</div>
            </div>
          </Reveal>
          <Reveal from="right" delay={120}>
            <h2 className="display text-4xl sm:text-5xl font-semibold leading-tight">Stop chasing clients for details.</h2>
            <p className="mt-4 max-w-md leading-relaxed text-white/70">
              Clients rarely remember every feature in a call. A guided form walks them through goals, users, pages, features, budget and timeline, so nothing gets missed.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <span className="grid size-10 place-items-center rounded-xl bg-white/10"><MessageSquareText className="size-5" /></span>
                <p className="mt-3 font-semibold">Clients narrate in their words</p>
                <p className="mt-1 text-sm text-white/60">Long-answer questions ask them to list every feature and example.</p>
              </div>
              <div>
                <span className="grid size-10 place-items-center rounded-xl bg-white/10"><Check className="size-5" /></span>
                <p className="mt-3 font-semibold">Fully editable</p>
                <p className="mt-1 text-sm text-white/60">Change, reorder or add questions before you share.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AI brief */}
      <section id="brief" className="mx-auto max-w-6xl px-5 pt-20 sm:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal from="left">
            <span className="inline-flex items-center gap-2 rounded-full bg-lime px-3 py-1 text-xs font-semibold text-forest">
              <Sparkles className="size-3.5" /> New
            </span>
            <h2 className="display mt-4 text-4xl sm:text-5xl font-semibold leading-tight">From a long response to a brief you can quote from</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-muted">
              One tap turns your client&apos;s answers into a single page: what they want, the full scope, budget and timeline, the risks, and the
              questions to ask before you send a price.
            </p>
            <ul className="mt-6 space-y-3 text-[15px]">
              {[
                [HelpCircle, "Follow-up questions ready to send on WhatsApp"],
                [AlertTriangle, "Spots risks like a big scope on a short deadline"],
                [FileDown, "Download it as a PDF to share or keep"],
                [Paperclip, "Files your client attached, right next to their answers"],
              ].map(([Icon, text]) => {
                const I = Icon as typeof Sparkles;
                return (
                  <li key={text as string} className="flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><I className="size-4" /></span>
                    <span className="pt-1">{text as string}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-sm text-muted">{SUMMARY_COST} credit per brief. <Link href="/docs/ai-brief-summary" className="text-brand-700 underline">How it works</Link></p>
          </Reveal>
          <Reveal from="right" delay={120}>
            <BriefMock />
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-end">
          <Reveal>
            <h2 className="display text-4xl sm:text-5xl font-semibold leading-tight">From a sentence to a shareable form</h2>
            <p className="mt-4 text-muted">Three steps. Most forms are ready in under 30 seconds.</p>
            <Link href={user ? "/generate" : "/signup"} className="btn mt-6 bg-lime text-forest hover:bg-[#b9e256]">
              Try it free <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n: "01", t: "Describe", b: "Tell the AI what your client wants: a website, an app, a brand, a video.", cls: "bg-forest text-white" },
              { n: "02", t: "Answer", b: "Tap through up to 4 quick questions so the form fits the project.", cls: "bg-[#eef2dc] text-ink" },
              { n: "03", t: "Share", b: "Copy the link and send it. Responses arrive in your account.", cls: "bg-[#9aa7a1] text-white" },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 130}>
                <div className={`card-hover flex h-full min-h-56 flex-col rounded-3xl p-6 ${s.cls}`}>
                  <span className="display text-5xl font-semibold">{s.n}</span>
                  <p className="mt-auto text-lg font-semibold">{s.t}</p>
                  <p className="mt-1 text-sm opacity-80">{s.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: LayoutTemplate, t: `${TEMPLATES.length} templates`, b: "Web, design, marketing, photography, events and more. Free to use." },
            { icon: Bell, t: "Notifications", b: "In-app and email alerts the moment a client submits." },
            { icon: Download, t: "CSV export", b: "Open every response in Excel or Google Sheets." },
            { icon: FileText, t: `${FIELD_TYPES.length} question types`, b: "Short and long answers, choices, dropdowns, dates, links and file uploads." },
          ].map((f, i) => (
            <Reveal key={f.t} delay={i * 90}>
              <div className="card-hover h-full rounded-3xl border border-line bg-white p-6">
                <f.icon className="size-6 text-brand" />
                <p className="mt-4 font-semibold">{f.t}</p>
                <p className="mt-1 text-sm text-muted">{f.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="display max-w-2xl text-4xl sm:text-5xl font-semibold leading-tight">Start from a proven client questionnaire</h2>
              <p className="mt-4 max-w-xl text-muted">
                {TEMPLATES.length} free templates written for client work, each with a note on why every question matters. Use one as it is or edit it in seconds.
              </p>
            </div>
            <Link href="/templates" className="btn-ghost h-11 shrink-0">
              Browse all {TEMPLATES.length} <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((t, i) => (
              <Reveal key={t.key} delay={i * 60}>
                <Link href={`/templates/${t.key}`} className="card-hover group flex h-full flex-col rounded-3xl border border-line bg-white p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">{t.category}</span>
                  <span className="mt-2 font-semibold leading-snug group-hover:underline">{t.seoTitle}</span>
                  <span className="mt-auto pt-4 text-sm text-muted">{questionCount(t)} questions</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Compared with Google Forms */}
      <section className="bg-forest text-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <Reveal>
            <h2 className="display max-w-2xl text-4xl sm:text-5xl font-semibold leading-tight">Why not just use Google Forms?</h2>
            <p className="mt-4 max-w-2xl text-white/70">
              Google Forms is great for surveys and quizzes. Formtified does one job: getting a complete brief from a client before you quote.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-10 overflow-hidden rounded-3xl border border-white/10">
            <div className="grid grid-cols-[1fr_1fr] text-sm sm:grid-cols-[1fr_1.2fr_1.2fr] sm:text-[15px]">
              <div className="hidden bg-white/5 px-5 py-4 font-semibold sm:block" />
              <div className="bg-white/5 px-5 py-4 font-semibold text-white/70">Google Forms</div>
              <div className="bg-lime px-5 py-4 font-semibold text-forest">Formtified</div>
              {[
                ["Writing the questions", "You start from a blank page", "AI writes them from one sentence about the project, or start from a client template"],
                ["What it's built for", "Surveys, quizzes, sign-up sheets", "Client briefs: goals, features, budget and timeline"],
                ["When a client submits", "A new row in a spreadsheet", "A readable response with an alert, and a one-page AI brief with follow-up questions"],
                ["Files from clients", "Clients must sign in to Google to upload", "Logos, photos and voice notes, no account needed"],
                ["Guidance for you", "None", "Every template explains why each question matters"],
              ].map(([label, them, us]) => (
                <div key={label} className="contents">
                  <div className="col-span-2 border-t border-white/10 px-5 pt-4 font-semibold sm:col-span-1 sm:py-4">{label}</div>
                  <div className="border-white/10 px-5 py-3 text-white/60 sm:border-t sm:py-4">{them}</div>
                  <div className="border-white/10 bg-white/5 px-5 py-3 sm:border-t sm:py-4">{us}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-canvas">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <Reveal>
            <h2 className="display text-center text-4xl sm:text-5xl font-semibold">Simple pricing</h2>
            <p className="mt-3 text-center text-muted">
              Start free. Buy AI credits only when you need them: {FORM_COST} credit writes a form, {SUMMARY_COST} credit summarises a response.
            </p>
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-[1fr_1.4fr]">
            <Reveal className="h-full rounded-3xl border border-line bg-white p-8">
              <p className="font-semibold text-brand-700">Free</p>
              <p className="display mt-2 text-5xl font-semibold">₦0</p>
              <ul className="mt-6 space-y-3 text-[15px]">
                {["20 AI credits when you sign up", "Unlimited forms from templates", "Unlimited responses and file uploads", "CSV export and email alerts"].map((x) => (
                  <li key={x} className="flex gap-2"><Check className="mt-0.5 size-5 shrink-0 text-brand" /> {x}</li>
                ))}
              </ul>
              <Link href={user ? "/dashboard" : "/signup"} className="btn-dark mt-8 w-full">Start free</Link>
            </Reveal>
            <Reveal delay={140} className="h-full rounded-3xl bg-forest p-8 text-white">
              <p className="font-semibold text-lime">Credit packs</p>
              <p className="mt-2 text-white/70">Top up any time. Credits never expire.</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                {PACKS.map((p) => (
                  <li key={p.id} className={`rounded-2xl p-4 ${p.featured ? "bg-lime text-forest" : "bg-white/10"}`}>
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="display mt-1 text-3xl font-semibold">{naira(p.naira)}</p>
                    <p className={`mt-1 text-sm ${p.featured ? "text-forest/75" : "text-white/70"}`}>{p.credits} credits</p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-center gap-2 text-sm text-white/70"><Wallet className="size-4" /> Pay with card, bank transfer or USSD through Paystack.</p>
              <Link href={user ? "/credits" : "/signup?next=%2Fcredits"} className="btn mt-6 w-full bg-white text-forest hover:bg-lime">Buy credits</Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
        <Reveal>
          <h2 className="display text-center text-4xl font-semibold">Questions</h2>
        </Reveal>
        <Reveal delay={100} className="mt-10 divide-y divide-line border-y border-line">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-canvas text-xl transition group-open:rotate-45">+</span>
              </summary>
              {/* Slides open each time the question is opened */}
              <p className="mt-3 leading-relaxed text-muted animate-error-in">{a}</p>
            </details>
          ))}
        </Reveal>
      </section>

      {/* Closing call to action */}
      <section className="px-5 pb-16">
        <Reveal from="scale" className="mx-auto max-w-6xl rounded-[2rem] bg-brand px-6 py-14 text-center text-white sm:px-12">
          <h2 className="display mx-auto max-w-2xl text-4xl sm:text-5xl font-semibold leading-tight">Your next client brief is one link away.</h2>
          <Link href={user ? "/generate" : "/signup"} className="btn mt-8 h-12 bg-white px-7 text-forest hover:bg-lime">
            Create your first form <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </section>
      <SiteFooter />
    </div>
  );
}

/** A sample AI brief, as it appears on a response. */
function BriefMock() {
  return (
    <div className="relative" aria-hidden="true">
      <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_center,rgba(201,239,107,0.35),transparent_70%)]" />
      <div className="rounded-[2rem] border border-line bg-white p-5 shadow-[var(--shadow-float)] sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-brand-100 text-sm font-medium">AO</span>
          <div>
            <p className="font-semibold">Adaeze Okafor</p>
            <p className="text-xs text-muted">Bakery Website Onboarding · 2 min ago</p>
          </div>
        </div>
        <div className="mt-4 rounded-3xl border border-brand/30 bg-brand-50/40 p-4 text-[13px] sm:text-sm">
          <p className="flex items-center gap-2 font-semibold text-brand-700"><Sparkles className="size-4" /> AI brief</p>
          <p className="mt-2 leading-relaxed">
            Adaeze runs a home bakery in Lekki and wants a website where customers can order cakes and pastries online and pay before delivery.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white px-3 py-2"><p className="text-[11px] text-muted">Budget</p><p className="font-semibold">₦300k - ₦800k</p></div>
            <div className="rounded-2xl bg-white px-3 py-2"><p className="text-[11px] text-muted">Timeline</p><p className="font-semibold">Before 1 December</p></div>
          </div>
          <p className="mt-3 font-semibold">Scope</p>
          <ul className="mt-1 space-y-1">
            {["Menu with photos and prices", "Online ordering with Paystack", "Delivery areas and fees", "WhatsApp order alerts"].map((x) => (
              <li key={x} className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-brand" /> {x}</li>
            ))}
          </ul>
          <div className="mt-3 rounded-2xl bg-white p-3">
            <p className="flex items-center gap-1.5 font-semibold"><HelpCircle className="size-3.5 text-brand-700" /> Ask before you quote</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-muted">
              <li>Who will take the product photos?</li>
              <li>Do you deliver outside Lekki?</li>
            </ol>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-line p-2 text-[13px]">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700"><Paperclip className="size-4" /></span>
          <span className="min-w-0 flex-1 truncate">bakery-logo.png · menu-2026.pdf</span>
          <Download className="mr-1 size-4 text-muted" />
        </div>
      </div>
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="grid overflow-hidden rounded-t-2xl bg-white text-left sm:grid-cols-[11rem_1fr]" aria-hidden="true">
      <div className="hidden bg-forest p-4 sm:block">
        <div className="flex items-center gap-1.5 text-white"><LogoMark dark className="size-6" /><Wordmark dark className="text-xs" /></div>
        <div className="mt-6 space-y-1 text-[12px]">
          {["Forms", "Generate", "Responses", "Account"].map((x, i) => (
            <div key={x} className={`rounded-lg px-3 py-2 ${i === 0 ? "bg-lime font-semibold text-forest" : "text-white/70"}`}>{x}</div>
          ))}
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="display text-lg sm:text-2xl font-semibold">How may I help you today?</p>
          <span className="hidden rounded-full border border-line px-3 py-1.5 text-[11px] text-muted sm:flex items-center gap-1.5"><Search className="size-3" /> Search your forms…</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="col-span-3 flex flex-col justify-end rounded-2xl bg-brand p-4 text-white sm:col-span-1 sm:min-h-32">
            <Sparkles className="size-5" />
            <p className="mt-6 text-sm font-semibold">Generate form with AI</p>
          </div>
          <div className="hidden rounded-2xl border border-line bg-brand-50/50 p-4 sm:block">
            <p className="text-[11px] text-muted">Responses this week</p>
            <p className="display mt-1 text-3xl font-semibold">12</p>
          </div>
          <div className="hidden rounded-2xl border border-line bg-brand-50/50 p-4 sm:block">
            <p className="text-[11px] text-muted">Credits</p>
            <p className="display mt-1 text-3xl font-semibold">46</p>
          </div>
        </div>
        <p className="mt-5 text-sm font-semibold">Your forms</p>
        <div className="mt-2 space-y-2">
          {[
            ["Bakery Website Onboarding", "Updated 2 minutes ago · 3 responses"],
            ["Fitness App Project Brief", "Updated 2 hours ago · 1 response"],
            ["Album Brand Identity", "Updated yesterday · 0 responses"],
          ].map(([t, s]) => (
            <div key={t} className="flex items-center gap-3 rounded-xl border border-line p-3">
              <span className="grid size-9 place-items-center rounded-lg bg-brand-50"><FileText className="size-4" /></span>
              <div>
                <p className="text-[13px] font-semibold">{t}</p>
                <p className="text-[11px] text-muted">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
