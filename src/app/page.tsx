import Link from "next/link";
import { ArrowRight, Check, Download, Bell, LayoutTemplate, MessageSquareText, Share2, Sparkles, Wand2, Inbox, FileText, Search } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/Logo";
import { LandingNav } from "@/components/landing/LandingNav";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { MockFormCard, MockResponseCard, MockChatCard } from "@/components/landing/Mocks";
import { getUser } from "@/lib/auth";
import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";
import { TEMPLATES, questionCount } from "@/lib/templates";

export const metadata = {
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, title: "Formtified: client onboarding forms for freelancers", description: SITE_DESCRIPTION, url: "/" },
};

const FAQS: [string, string][] = [
  ["Is Formtified free?", "Yes. Templates, editing, sharing and unlimited responses are free. You also get 20 AI credits when you sign up; one credit creates one AI-written form."],
  ["Does my client need an account?", "No. They open the link, fill the form and submit. Only you need an account."],
  ["Can I send the form on WhatsApp?", "Yes. Copy your form's link and paste it into any chat. The link shows a preview with your form's title, and your client fills it on their phone."],
  ["How is Formtified different from Google Forms?", "Google Forms is a general tool for surveys and quizzes, and you start from a blank page. Formtified is built for client briefs: the AI writes the questions for your project, the templates are made for client work, and each response arrives as a readable brief with an alert."],
  ["Can I edit the form the AI makes?", "Yes. Change any question, add or remove questions, reorder them and change question types before or after sharing."],
  ["What happens when I run out of credits?", "You can still use templates, build forms by hand, edit forms and collect unlimited responses. Credit packs are coming soon."],
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
      { "@type": "Organization", "@id": `${url}/#org`, name: SITE_NAME, url, logo: `${url}/icon.svg`, email: CONTACT_EMAIL },
      { "@type": "WebSite", "@id": `${url}/#website`, name: SITE_NAME, url, publisher: { "@id": `${url}/#org` } },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: SITE_DESCRIPTION,
        offers: { "@type": "Offer", price: "0", priceCurrency: "NGN" },
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
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 110}>
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
            { icon: FileText, t: "11 question types", b: "Short and long answers, choices, dropdowns, dates, links and more." },
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
                ["When a client submits", "A new row in a spreadsheet", "A readable brief in your inbox, with an in-app and email alert"],
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
            <p className="mt-3 text-center text-muted">One credit generates one AI form. Everything else is free.</p>
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            <Reveal className="h-full rounded-3xl border border-line bg-white p-8">
              <p className="font-semibold text-brand-700">Free</p>
              <p className="display mt-2 text-5xl font-semibold">₦0</p>
              <ul className="mt-6 space-y-3 text-[15px]">
                {["20 AI credits when you sign up", "Unlimited forms from templates", "Unlimited responses", "CSV export and email alerts"].map((x) => (
                  <li key={x} className="flex gap-2"><Check className="mt-0.5 size-5 shrink-0 text-brand" /> {x}</li>
                ))}
              </ul>
              <Link href={user ? "/dashboard" : "/signup"} className="btn-dark mt-8 w-full">Start free</Link>
            </Reveal>
            <Reveal delay={140} className="h-full rounded-3xl bg-forest p-8 text-white">
              <p className="font-semibold text-lime">Credit packs</p>
              <p className="display mt-2 text-5xl font-semibold">Soon</p>
              <ul className="mt-6 space-y-3 text-[15px] text-white/85">
                {["Top up AI credits when you need more", "Credits never expire", "Pay in Naira", "Everything in Free"].map((x) => (
                  <li key={x} className="flex gap-2"><Check className="mt-0.5 size-5 shrink-0 text-lime" /> {x}</li>
                ))}
              </ul>
              <button disabled className="btn mt-8 w-full bg-white/10 text-white">Coming soon</button>
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
