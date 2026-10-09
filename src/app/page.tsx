import Link from "next/link";
import { ArrowRight, Check, Download, Bell, LayoutTemplate, MessageSquareText, Share2, Sparkles, Wand2, Inbox, FileText, Search } from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";
import { LandingNav } from "@/components/landing/LandingNav";
import { MockFormCard, MockResponseCard, MockChatCard } from "@/components/landing/Mocks";
import { getUser } from "@/lib/auth";

export default async function Home() {
  const user = await getUser().catch(() => null);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#e8eeeb]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.8),transparent_60%)]" />
        <LandingNav signedIn={Boolean(user)} />
        <div className="relative mx-auto max-w-6xl px-5 pt-14 sm:pt-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm">
            <Sparkles className="size-4" /> AI onboarding forms for creators
          </span>
          <h1 className="display mx-auto mt-6 max-w-4xl text-[2.6rem] leading-[1.05] font-semibold text-ink sm:text-6xl lg:text-7xl">
            Know exactly what your client wants to build.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-lg">
            Describe the project to Formtified AI. It asks a few questions, then builds a ready-to-share form your client fills to narrate every feature.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={user ? "/generate" : "/signup"} className="btn-dark h-12 px-7">
              Get Started <ArrowRight className="size-4" />
            </Link>
            <a href="#how" className="btn h-12 bg-[#9aa7a1] px-7 text-white hover:bg-[#87958e]">See how it works</a>
          </div>
          <p className="mt-4 text-sm text-muted">Free to start · 20 AI credits · no card needed</p>

          {/* Product mock */}
          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="rounded-t-[1.75rem] border-[10px] border-b-0 border-ink bg-ink">
              <DashboardMock />
            </div>
            <div className="absolute -right-2 top-10 hidden w-64 md:block lg:-right-10"><MockResponseCard /></div>
            <div className="absolute -left-2 top-40 hidden w-64 -rotate-2 lg:block lg:-left-12"><MockChatCard /></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <h2 className="display mx-auto max-w-2xl text-center text-4xl sm:text-5xl font-semibold leading-tight">Onboarding that gets the full picture</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted">
          No more voice notes, scattered chats and forgotten features. One link collects everything before you quote or start work.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: Wand2, tint: "bg-lime", title: "AI-built forms", body: "Describe the project in a sentence. The AI asks up to 4 quick questions, then writes the whole form in seconds." },
            { icon: Share2, tint: "bg-[#e3dbf7]", title: "Share one link", body: "Send it on WhatsApp, email or DM. Clients fill it on any phone, no account needed." },
            { icon: Inbox, tint: "bg-[#efe6d2]", title: "Answers in your account", body: "Every response lands in your dashboard with an in-app and email alert. Export to CSV any time." },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl border border-line bg-canvas/60 p-7">
              <span className={`grid size-12 place-items-center rounded-2xl ${f.tint}`}><f.icon className="size-5 text-ink" /></span>
              <h3 className="mt-6 text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dark band */}
      <section className="bg-forest text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="rounded-[2.5rem] border-[10px] border-[#0a1f15] bg-canvas p-4 shadow-2xl">
              <div className="rounded-2xl bg-forest px-4 pb-10 pt-4 text-[11px] text-white/80">Sent by Tolu Designs</div>
              <div className="-mt-7"><MockFormCard /></div>
              <div className="mt-3 h-10 rounded-full bg-brand text-center text-sm leading-10 font-semibold text-white">Submit</div>
            </div>
          </div>
          <div>
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
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-end">
          <div>
            <h2 className="display text-4xl sm:text-5xl font-semibold leading-tight">From a sentence to a shareable form</h2>
            <p className="mt-4 text-muted">Three steps. Most forms are ready in under 30 seconds.</p>
            <Link href={user ? "/generate" : "/signup"} className="btn mt-6 bg-lime text-forest hover:bg-[#b9e256]">
              Try it free <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n: "01", t: "Describe", b: "Tell the AI what your client wants: a website, an app, a brand, a video.", cls: "bg-forest text-white" },
              { n: "02", t: "Answer", b: "Tap through up to 4 quick questions so the form fits the project.", cls: "bg-[#eef2dc] text-ink" },
              { n: "03", t: "Share", b: "Copy the link and send it. Responses arrive in your account.", cls: "bg-[#9aa7a1] text-white" },
            ].map((s) => (
              <div key={s.n} className={`flex min-h-56 flex-col rounded-3xl p-6 ${s.cls}`}>
                <span className="display text-5xl font-semibold">{s.n}</span>
                <p className="mt-auto text-lg font-semibold">{s.t}</p>
                <p className="mt-1 text-sm opacity-80">{s.b}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: LayoutTemplate, t: "Templates", b: "Website, app, e-commerce, branding, social media and video. Free to use." },
            { icon: Bell, t: "Notifications", b: "In-app and email alerts the moment a client submits." },
            { icon: Download, t: "CSV export", b: "Open every response in Excel or Google Sheets." },
            { icon: FileText, t: "11 question types", b: "Short and long answers, choices, dropdowns, dates, links and more." },
          ].map((f) => (
            <div key={f.t} className="rounded-3xl border border-line p-6">
              <f.icon className="size-6 text-brand" />
              <p className="mt-4 font-semibold">{f.t}</p>
              <p className="mt-1 text-sm text-muted">{f.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-canvas">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <h2 className="display text-center text-4xl sm:text-5xl font-semibold">Simple pricing</h2>
          <p className="mt-3 text-center text-muted">One credit generates one AI form. Everything else is free.</p>
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-line bg-white p-8">
              <p className="font-semibold text-brand-700">Free</p>
              <p className="display mt-2 text-5xl font-semibold">₦0</p>
              <ul className="mt-6 space-y-3 text-[15px]">
                {["20 AI credits when you sign up", "Unlimited forms from templates", "Unlimited responses", "CSV export and email alerts"].map((x) => (
                  <li key={x} className="flex gap-2"><Check className="mt-0.5 size-5 shrink-0 text-brand" /> {x}</li>
                ))}
              </ul>
              <Link href={user ? "/dashboard" : "/signup"} className="btn-dark mt-8 w-full">Start free</Link>
            </div>
            <div className="rounded-3xl bg-forest p-8 text-white">
              <p className="font-semibold text-lime">Credit packs</p>
              <p className="display mt-2 text-5xl font-semibold">Soon</p>
              <ul className="mt-6 space-y-3 text-[15px] text-white/85">
                {["Top up AI credits when you need more", "Credits never expire", "Pay in Naira", "Everything in Free"].map((x) => (
                  <li key={x} className="flex gap-2"><Check className="mt-0.5 size-5 shrink-0 text-lime" /> {x}</li>
                ))}
              </ul>
              <button disabled className="btn mt-8 w-full bg-white/10 text-white">Coming soon</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
        <h2 className="display text-center text-4xl font-semibold">Questions</h2>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {[
            ["Does my client need an account?", "No. They open the link, fill the form and submit. Only you need an account."],
            ["Can I edit the form the AI makes?", "Yes. Change any question, add or remove questions, reorder them and change question types before or after sharing."],
            ["What happens when I run out of credits?", "You can still use templates, build forms by hand, edit forms and collect unlimited responses. Credit packs are coming soon."],
            ["Who is Formtified for?", "Web and app developers, designers, video editors, social media managers and any creator who needs a clear brief from clients."],
          ].map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-canvas text-xl transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA + footer */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-brand px-6 py-14 text-center text-white sm:px-12">
          <h2 className="display mx-auto max-w-2xl text-4xl sm:text-5xl font-semibold leading-tight">Your next client brief is one link away.</h2>
          <Link href={user ? "/generate" : "/signup"} className="btn mt-8 h-12 bg-white px-7 text-forest hover:bg-lime">
            Create your first form <ArrowRight className="size-4" />
          </Link>
        </div>
        <footer className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} Formtified. Built in Lagos.</p>
        </footer>
      </section>
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="grid overflow-hidden rounded-t-2xl bg-white text-left sm:grid-cols-[11rem_1fr]" aria-hidden="true">
      <div className="hidden bg-forest p-4 sm:block">
        <div className="flex items-center gap-2"><LogoMark className="size-6" /><span className="display text-sm font-semibold text-white">Formtified</span></div>
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
