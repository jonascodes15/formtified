"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BadgeCheck, ChartColumn, FileText, History, LayoutDashboard, Megaphone, Menu, Users, X } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/Logo";
import { Drawer } from "@/components/Drawer";
import { LogoutButton } from "@/components/LogoutButton";
import { initials } from "@/lib/format";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Site visits", icon: ChartColumn },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/subscribers", label: "Subscribers", icon: BadgeCheck },
  { href: "/admin/forms", label: "Forms", icon: FileText },
  { href: "/admin/notifications", label: "Notifications", icon: Megaphone },
  { href: "/admin/activity", label: "Activity log", icon: History },
];

export function AdminShell({ children, name, email }: { children: React.ReactNode; name: string; email: string }) {
  const path = usePathname();
  const active = (href: string, exact?: boolean) => (exact ? path === href : path === href || path.startsWith(href + "/"));
  const current = NAV.find((n) => active(n.href, n.exact));
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const navLinks = (onClick?: () => void) =>
    NAV.map((item) => {
      const on = active(item.href, item.exact);
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className={`flex items-center gap-3 rounded-2xl px-4 h-11 text-[15px] font-medium transition ${
            on ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/8 hover:text-white"
          }`}
        >
          <item.icon className="size-5" strokeWidth={on ? 2.2 : 1.8} />
          {item.label}
        </Link>
      );
    });

  const account = (
    <div className="flex items-center gap-3 rounded-2xl bg-white/8 p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lime text-sm font-semibold text-forest">{initials(name)}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{name}</span>
        <span className="block truncate text-xs text-white/60">{email}</span>
      </span>
    </div>
  );

  const footerLinkClass = "flex w-full items-center gap-2 rounded-2xl px-4 h-11 text-sm text-white/70 transition hover:bg-white/8 hover:text-white disabled:opacity-60";

  const logoutClass = footerLinkClass.replace("hover:text-white", "hover:text-red-300");

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar: dark, so it is always clear you are in admin mode */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col overflow-y-auto bg-forest px-5 py-6 text-white">
        <Link href="/admin" className="flex items-center gap-1.5">
          <LogoMark />
          <Wordmark dark />
          <span className="ml-1 rounded-full bg-lime px-2 py-0.5 text-[11px] font-semibold text-forest">Admin</span>
        </Link>
        <nav className="mt-10 flex flex-col gap-1">{navLinks()}</nav>
        <div className="mt-auto space-y-1 pt-6">
          <Link href="/dashboard" className={footerLinkClass}>
            <ArrowLeft className="size-4" /> Back to app
          </Link>
          <LogoutButton className={logoutClass} />
          <div className="pt-2">{account}</div>
        </div>
      </aside>

      {/* Mobile: top bar with the current page and a ☰ menu */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-3 bg-forest px-5 py-3 text-white">
        <Link href="/admin" className="flex min-w-0 items-center gap-2">
          <LogoMark className="size-7 shrink-0" />
          <span className="truncate">
            <span className="display text-lg font-semibold">Admin</span>
            {current && <span className="text-white/60"> · {current.label}</span>}
          </span>
        </Link>
        <button onClick={() => setMenuOpen(true)} aria-label="Open admin menu" className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/15">
          <Menu className="size-5" />
        </button>
      </header>

      <Drawer open={menuOpen} onClose={closeMenu} label="Admin menu" className="bg-forest text-white">
        <div className="flex items-center justify-between px-5 pt-5">
          <span className="flex items-center gap-2">
            <LogoMark />
            <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-semibold text-forest">Admin</span>
          </span>
          <button onClick={closeMenu} aria-label="Close menu" className="grid size-10 place-items-center rounded-full hover:bg-white/10">
            <X className="size-5" />
          </button>
        </div>
        <div className="mx-5 mt-5">{account}</div>
        <nav className="mt-4 flex flex-col gap-1 px-3">{navLinks(closeMenu)}</nav>
        <div className="mt-auto space-y-1 px-3 pb-[max(env(safe-area-inset-bottom),20px)] pt-6">
          <Link href="/dashboard" onClick={closeMenu} className={footerLinkClass}>
            <ArrowLeft className="size-4" /> Back to app
          </Link>
          <LogoutButton className={logoutClass} />
        </div>
      </Drawer>

      <main className="lg:pl-64 pb-16">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 pt-6 sm:pt-8">{children}</div>
      </main>
    </div>
  );
}
