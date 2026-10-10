"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LockOpen, Trash2 } from "lucide-react";

/** Close / reopen / delete buttons for one row on the admin Forms page. */
export function FormActions({ id, title, status }: { id: number; title: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function call(method: "PATCH" | "DELETE", body?: object) {
    setBusy(true);
    const res = await fetch(`/api/admin/forms/${id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Something went wrong.");
      return;
    }
    router.refresh();
  }

  const closed = status === "closed";
  return (
    <div className="flex justify-end gap-1">
      <button
        disabled={busy}
        onClick={() => call("PATCH", { status: closed ? "published" : "closed" })}
        title={closed ? "Reopen form" : "Close form (stop new responses)"}
        aria-label={closed ? `Reopen ${title}` : `Close ${title}`}
        className="grid size-9 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink disabled:opacity-50"
      >
        {closed ? <LockOpen className="size-4" /> : <Lock className="size-4" />}
      </button>
      <button
        disabled={busy}
        onClick={() => confirm(`Delete "${title}" and all its responses? This cannot be undone.`) && call("DELETE")}
        title="Delete form"
        aria-label={`Delete ${title}`}
        className="grid size-9 place-items-center rounded-full text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
