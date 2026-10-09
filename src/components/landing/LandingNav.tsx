"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const LINKS = [
  ["Features", "#features"],
  ["How it works", "#how"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
];

export function LandingNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <Logo />
      <nav className="hidden items-center gap-8 text-sm font-medium text-ink/80 md:flex">
        {LINKS.map(([l, h]) => (
          <a key={h} href={h} className="hover:text-ink">{l}</a>
        ))}
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        {signedIn ? (
          <Link href="/dashboard" className="btn-dark h-10">Open dashboard</Link>
        ) : (
          <>
            <Link href="/login" className="btn h-10 border border-ink/20 bg-transparent text-ink hover:bg-white">Log in</Link>
            <Link href="/signup" className="btn-dark h-10">Register</Link>
          </>
        )}
      </div>
      <button onClick={() => setOpen((o) => !o)} className="grid size-10 place-items-center rounded-xl border border-ink/15 md:hidden" aria-label="Menu" aria-expanded={open}>
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <div className="absolute inset-x-5 top-full rounded-3xl bg-white p-4 shadow-[var(--shadow-float)] md:hidden animate-rise">
          {LINKS.map(([l, h]) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-medium hover:bg-canvas">{l}</a>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            {signedIn ? (
              <Link href="/dashboard" className="btn-dark col-span-2">Open dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">Log in</Link>
                <Link href="/signup" className="btn-dark">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
