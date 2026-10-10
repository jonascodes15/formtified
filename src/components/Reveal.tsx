"use client";

import { useEffect, useRef } from "react";

/**
 * Fades its content in as it scrolls into view (once). Styles live in globals.css (.reveal).
 * - from: the direction it comes from ("up" is the default).
 * - delay: milliseconds to wait, to stagger items in a row.
 * Content stays visible if JavaScript is off, and for people who turned on "reduce motion".
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  from = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "up" | "left" | "right" | "scale";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => el.setAttribute("data-shown", "");
    if (!("IntersectionObserver" in window)) return show();
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-from={from} className={`reveal ${className}`} style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}>
      {children}
    </div>
  );
}
