"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

/** Opens the browser's print window, where "Save as PDF" is one of the printers. */
export function PrintButton({ auto }: { auto?: boolean }) {
  useEffect(() => {
    if (!auto) return;
    // Give fonts a moment to load so the PDF looks right.
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [auto]);

  return (
    <button onClick={() => window.print()} className="btn-dark h-10 shrink-0 px-4">
      <Printer className="size-4" /> Save as PDF
    </button>
  );
}
