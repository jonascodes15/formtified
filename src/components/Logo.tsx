import { useId } from "react";
import Link from "next/link";

/** Colours for light backgrounds (default) and dark backgrounds. */
const PALETTE = {
  light: { doc: "#123826", f: "#123826", pencil: "#4ba256", tip: "#c9ef6b", lead: "#123826" },
  dark: { doc: "#c9ef6b", f: "#ffffff", pencil: "#c9ef6b", tip: "#ffffff", lead: "#123826" },
};

// The pencil is drawn along +x from its tip at (0,0), then turned to point down-left onto the page.
const PENCIL_AT = "translate(17.2 27.6) rotate(-45)";

/**
 * The Formtified mark: a page with a bold "F", and a pencil writing on it.
 * Use `dark` on dark backgrounds.
 */
export function LogoMark({ className = "size-8", dark = false }: { className?: string; dark?: boolean }) {
  // Each copy needs its own mask id, or a copy inside a hidden menu can break the visible one.
  const id = useId();
  const c = dark ? PALETTE.dark : PALETTE.light;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      {/* Cuts a small gap in the page where the pencil crosses it */}
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
        <rect width="32" height="32" fill="#fff" />
        <g transform={PENCIL_AT} fill="#000" stroke="#000" strokeWidth="3.2" strokeLinejoin="round">
          <path d="M0 0 4.4-2.5H14v5H4.4z" />
          <rect x="14.6" y="-2.5" width="3.4" height="5" rx="1.4" />
        </g>
      </mask>
      <g mask={`url(#${id})`}>
        <rect x="5" y="3" width="19" height="26" rx="3.4" fill="none" stroke={c.doc} strokeWidth="2.4" />
        <rect x="9.6" y="8" width="3.6" height="15" rx="0.9" fill={c.f} />
        <rect x="9.6" y="8" width="10.4" height="3.4" rx="0.9" fill={c.f} />
        <rect x="9.6" y="14.2" width="7.8" height="3.2" rx="0.9" fill={c.f} />
      </g>
      <g transform={PENCIL_AT}>
        <path d="M0 0 4.4-2.5v5z" fill={c.tip} />
        <path d="M0 0 1.7-.97v1.94z" fill={c.lead} />
        <rect x="4.4" y="-2.5" width="9.6" height="5" fill={c.pencil} />
        <rect x="14.6" y="-2.5" width="3.4" height="5" rx="1.4" fill={c.pencil} />
      </g>
    </svg>
  );
}

/** The mark on a dark-green rounded tile, the same as the favicon. Good for small avatars. */
export function LogoTile({ className = "size-8" }: { className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-[22%] bg-forest ${className}`} aria-hidden="true">
      <LogoMark dark className="size-[80%] translate-x-[2%]" />
    </span>
  );
}

/** "FORMTIFIED" in the squared logo font. */
export function Wordmark({ dark = false, className = "text-lg" }: { dark?: boolean; className?: string }) {
  return <span className={`font-logo uppercase tracking-[0.04em] ${dark ? "text-white" : "text-forest"} ${className}`}>Formtified</span>;
}

/** Mark + thin divider + wordmark, like a printed logo. */
export function Logo({ href = "/", dark = false }: { href?: string; dark?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5" aria-label="Formtified home">
      <LogoMark dark={dark} />
      <span className={`h-6 w-px ${dark ? "bg-white/30" : "bg-forest/25"}`} aria-hidden="true" />
      <Wordmark dark={dark} />
    </Link>
  );
}
