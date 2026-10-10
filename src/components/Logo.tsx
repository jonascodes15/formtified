import { useId } from "react";
import Link from "next/link";

/**
 * The Formtified mark: an "F" whose middle arm is a checkmark (Form + certified),
 * on a green-to-forest tile. Works on light and dark backgrounds.
 */
export function LogoMark({ className = "size-8" }: { className?: string }) {
  // Each copy needs its own gradient id, or a copy inside a hidden menu can break the visible one.
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5cb867" />
          <stop offset="1" stopColor="#17472f" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <g transform="translate(-0.8 0)">
        <rect x="8" y="7" width="4.2" height="18" rx="2.1" fill="#fff" />
        <rect x="8" y="7" width="11.5" height="4.2" rx="2.1" fill="#fff" />
        <path d="M12.3 17.6l3.1 3.1 8.6-8.6" stroke="#c9ef6b" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

/** "Form" in ink (or white) + "tified" in brand green (or lime on dark backgrounds). */
export function Wordmark({ dark = false, className = "text-xl" }: { dark?: boolean; className?: string }) {
  return (
    <span className={`display font-semibold tracking-tight ${className}`}>
      <span className={dark ? "text-white" : "text-ink"}>Form</span>
      <span className={dark ? "text-lime" : "text-brand-600"}>tified</span>
    </span>
  );
}

export function Logo({ href = "/", dark = false }: { href?: string; dark?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2" aria-label="Formtified home">
      <LogoMark />
      <Wordmark dark={dark} />
    </Link>
  );
}
