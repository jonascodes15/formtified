"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, WandSparkles, Inbox, UserRound, LayoutTemplate, Wallet, Shield, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Drawer } from "@/components/Drawer";
import { LogoutButton } from "@/components/LogoutButton";
import { initials } from "@/lib/format";
import { MenuContext } from "./MenuButton";

const NAV = [
  { href: "/dashboard", label: "Forms", icon: FileText, match: ["/dashboard", "/forms"] },
  { href: "/generate", label: "Generate", icon: WandSparkles, match: ["/generate"] },
  { href: "/responses", label: "Responses", icon: Inbox, match: ["/responses"] },
  { href: "/account", label: "Account", icon: UserRound, match: ["/account"] },
];

const EXTRA = [
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/credits", label: "Credits", icon: Wallet },
];

export function AppShell({
  children,
  credits,
  unreadResponses,
  isAdmin = false,
  name,
  email,
}: {
  children: React.ReactNode;
  credits: number;
  unreadResponses: number;
  isAdmin?: boolean;
  name: string;
  email: string;
}) {
  const path = usePathname();
  const active = (m: string[]) => m.some((p) => path === p || path.startsWith(p + "/"));
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const menu = useMemo(() => ({ open: () => setMenuOpen(true) }), []);
  const extra = [...EXTRA, ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : [])];

  return (
    <MenuContext.Provider value={menu}>
      <div className="min-h-dvh">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col overflow-y-auto border-r border-line bg-white px-5 py-6">
          <Logo href="/dashboard" />
          <nav className="mt-10 flex flex-col gap-1">
            {NAV.map((item) => {
              const on = active(item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 h-11 text-[15px] font-medium transition ${
                    on ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-canvas hover:text-ink"
                  }`}
                >
                  <item.icon className="size-5" strokeWidth={on ? 2.2 : 1.8} />
                  {item.label}
                  {item.href === "/responses" && unreadResponses > 0 && (
                    <span className="ml-auto rounded-full bg-brand px-2 text-xs font-semibold text-white">{unreadResponses}</span>
                  )}
                </Link>
              );
            })}
            <div className="my-3 h-px bg-line" />
            {extra.map((item) => {
              const on = active([item.href]);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 h-11 text-[15px] font-medium transition ${
                    on ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-canvas hover:text-ink"
                  }`}
                >
                  <item.icon className="size-5" strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-6">
            <div className="rounded-3xl bg-forest p-5 text-white">
              <p className="text-sm text-white/70">Credits left</p>
              <p className="display mt-1 text-3xl font-semibold">{credits}</p>
              <p className="mt-1 text-xs text-white/60">1 credit = 1 AI-generated form</p>
              <Link href="/generate" className="btn btn-sm mt-4 w-full bg-lime text-forest hover:bg-white">
                <WandSparkles className="size-4" /> New AI form
              </Link>
            </div>
            <LogoutButton className="mt-3 flex w-full items-center gap-3 rounded-2xl px-4 h-11 text-[15px] font-medium text-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60" />
          </div>
        </aside>

        <main className="lg:pl-64 pb-32 lg:pb-12">
          <div className="mx-auto w-full max-w-5xl px-5 sm:px-8 pt-6 sm:pt-8">{children}</div>
        </main>

        {/* Mobile menu (opened by the ☰ button in each page's header) */}
        <Drawer open={menuOpen} onClose={closeMenu} label="Menu">
          <div className="flex items-center justify-between px-5 pt-5">
            <Logo href="/dashboard" />
            <button onClick={closeMenu} aria-label="Close menu" className="grid size-10 place-items-center rounded-full hover:bg-canvas">
              <X className="size-5" />
            </button>
          </div>
          <div className="mx-5 mt-5 flex items-center gap-3 rounded-2xl bg-canvas p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-medium">{initials(name)}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{name}</span>
              <span className="block truncate text-xs text-muted">{email}</span>
            </span>
          </div>
          <nav className="mt-4 flex flex-col gap-1 px-3">
            {[...NAV, ...extra.map((e) => ({ ...e, match: [e.href] }))].map((item, i) => {
              const on = active(item.match);
              return (
                <div key={item.href}>
                  {i === NAV.length && <div className="mx-2 my-2 h-px bg-line" />}
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 rounded-2xl px-4 h-12 text-[15px] font-medium transition ${
                      on ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-canvas"
                    }`}
                  >
                    <item.icon className="size-5" strokeWidth={on ? 2.2 : 1.8} />
                    {item.label}
                    {item.href === "/responses" && unreadResponses > 0 && (
                      <span className="ml-auto rounded-full bg-brand px-2 text-xs font-semibold text-white">{unreadResponses}</span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
          <div className="mt-auto px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-6">
            <div className="flex items-center justify-between rounded-2xl bg-forest px-4 py-3 text-white">
              <span>
                <span className="block text-xs text-white/70">Credits left</span>
                <span className="display text-2xl font-semibold">{credits}</span>
              </span>
              <Link href="/generate" onClick={closeMenu} className="btn btn-sm bg-lime text-forest hover:bg-white">
                <WandSparkles className="size-4" /> New AI form
              </Link>
            </div>
            <LogoutButton className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-line h-12 text-[15px] font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60" />
          </div>
        </Drawer>

        {/* Mobile bottom nav (hidden on desktop) */}
        <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),14px)]">
          <div className="mx-auto flex max-w-md items-center justify-between rounded-full border border-white/80 bg-white/85 p-1.5 shadow-[var(--shadow-float)] backdrop-blur-xl">
            {NAV.map((item) => {
              const on = active(item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[12px] font-medium transition ${
                    on ? "bg-brand-50 text-brand-700" : "text-ink"
                  }`}
                >
                  <item.icon className={`size-[22px] ${on ? "fill-brand/20" : ""}`} strokeWidth={on ? 2.2 : 1.7} />
                  {item.label}
                  {item.href === "/responses" && unreadResponses > 0 && (
                    <span className="absolute right-[22%] top-1.5 size-2 rounded-full bg-brand ring-2 ring-white" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </MenuContext.Provider>
  );
}
