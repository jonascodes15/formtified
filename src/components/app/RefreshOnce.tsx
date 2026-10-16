"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-renders the page once, so parts loaded alongside it (like the sidebar's credit count) pick up a change. */
export function RefreshOnce() {
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, [router]);
  return null;
}
