import Link from "next/link";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#4ba256" />
      <rect x="8" y="7" width="13" height="16" rx="3" fill="#fff" />
      <rect x="11" y="11" width="7" height="1.8" rx=".9" fill="#4ba256" />
      <rect x="11" y="14.6" width="5" height="1.8" rx=".9" fill="#4ba256" />
      <path d="M22.5 17.5l1.1 2.6 2.6 1.1-2.6 1.1-1.1 2.6-1.1-2.6-2.6-1.1 2.6-1.1z" fill="#c9ef6b" />
    </svg>
  );
}

export function Logo({ href = "/", dark = false }: { href?: string; dark?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2" aria-label="Formtified home">
      <LogoMark />
      <span className={`display text-xl font-semibold ${dark ? "text-white" : "text-ink"}`}>Formtified</span>
    </Link>
  );
}
