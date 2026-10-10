"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

/** Signs the user out and sends them to the sign-in page. */
export function LogoutButton({ className, label = "Log out" }: { className?: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} disabled={busy} className={className}>
      <LogOut className="size-4" /> {busy ? "Logging out…" : label}
    </button>
  );
}
