"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/Logo";
import { COMPANY } from "@/lib/site";
import { MockFormCard, MockResponseCard, MockChatCard } from "./Mocks";

const SLIDES = [
  { title: "Describe it once. Get a ready form.", body: "Tell Formtified AI what your client wants to build. It asks a few questions and writes the onboarding form for you." },
  { title: "Your clients narrate every feature.", body: "Send one link. Clients explain their goals, features, budget and timeline in their own words." },
  { title: "Every answer, in one place.", body: "Get notified when a client submits, read each response, and export to a spreadsheet." },
];

/** The two-panel frame shared by sign in, sign up, email code and password screens. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-dvh bg-[#dfe6e3] p-0 sm:p-6 lg:p-8 grid place-items-center">
      <div className="grid w-full max-w-6xl overflow-hidden bg-white sm:rounded-[2rem] sm:p-3 lg:grid-cols-2 lg:gap-3 shadow-[var(--shadow-float)] min-h-dvh sm:min-h-0">
        {/* Form side */}
        <div className="flex flex-col rounded-3xl px-6 py-8 sm:px-10 lg:border lg:border-line">
          <Logo />
          <div className="mx-auto my-auto w-full max-w-sm py-10">{children}</div>
          <p className="text-center text-xs text-soft">
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved. ·{" "}
            <Link href="/#faq" className="text-brand-700 hover:underline">Help</Link>
          </p>
        </div>

        {/* Showcase side (desktop only) */}
        <div className="relative hidden overflow-hidden rounded-3xl bg-forest lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:56px_56px]" />
          <div className="absolute -right-20 -top-20 size-96 rounded-full bg-brand/30 blur-3xl" />
          <div className="relative h-[31rem]">
            <div className="absolute left-12 top-12 w-64 rotate-[-3deg]"><MockChatCard /></div>
            <div className="absolute right-10 top-24 w-60"><MockFormCard /></div>
            <div className="absolute left-16 top-[16.5rem] w-64"><MockResponseCard /></div>
          </div>
          <div className="relative mt-auto px-10 pb-8 text-center text-white">
            <LogoMark dark className="mx-auto size-14" />
            <div key={slide} className="animate-rise">
              <h2 className="display mt-5 text-3xl font-semibold leading-tight">{SLIDES[slide].title}</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70">{SLIDES[slide].body}</p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2">
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} className={`h-1 rounded-full transition ${i === slide ? "bg-white" : "bg-white/25"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Field({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label} <span className="text-brand">*</span></span>
      <span className="flex h-12 items-center gap-3 rounded-2xl border border-line px-4 text-[15px] focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
        <Icon className="size-4 shrink-0 text-muted" />
        {children}
      </span>
    </label>
  );
}

export function FormError({ error }: { error: string }) {
  if (!error) return null;
  return <p key={error} className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 animate-error-in">{error}</p>;
}
