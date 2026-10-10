"use client";

import { createContext, useContext } from "react";
import { Menu } from "lucide-react";

/** Lets the ☰ button in each page's header open the menu that lives in AppShell. */
export const MenuContext = createContext<{ open: () => void } | null>(null);

export function MenuButton() {
  const menu = useContext(MenuContext);
  if (!menu) return null;
  return (
    <button
      onClick={menu.open}
      aria-label="Open menu"
      className="lg:hidden grid size-14 place-items-center rounded-full bg-white shadow-[var(--shadow-card)] border border-line/60 hover:bg-brand-50 transition"
    >
      <Menu className="size-6" strokeWidth={1.7} />
    </button>
  );
}
