"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// The outside site that sent the visitor is only known on the first page load.
let firstView = true;

/** Sends one tiny request per page view to /api/track. Renders nothing. */
export function VisitTracker() {
  const path = usePathname();

  useEffect(() => {
    if (!path || path.startsWith("/admin")) return;
    const body = JSON.stringify({ path, referrer: firstView ? document.referrer : "" });
    firstView = false;
    try {
      const blob = new Blob([body], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/track", blob)) {
        fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
      }
    } catch {}
  }, [path]);

  return null;
}
