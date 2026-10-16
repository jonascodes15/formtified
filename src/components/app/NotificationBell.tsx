"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Megaphone } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { timeAgo } from "@/lib/format";

interface Item {
  id: number;
  form_id: number | null;
  response_id: number | null;
  kind: string; // "response" | "admin" | "payment"
  title: string | null;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  // Goes up each time a new notification arrives while the page is open, which replays the bell wiggle.
  const [rings, setRings] = useState(0);
  const lastUnread = useRef<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/notifications")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (alive && d) {
            if (lastUnread.current !== null && d.unread > lastUnread.current) setRings((r) => r + 1);
            lastUnread.current = d.unread;
            setItems(d.items);
            setUnread(d.unread);
          }
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      fetch("/api/notifications", { method: "POST" }).catch(() => {});
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label={`Notifications${unread ? ` (${unread} new)` : ""}`}
        className="relative grid size-14 place-items-center rounded-full bg-white shadow-[var(--shadow-card)] border border-line/60 hover:bg-brand-50 transition ease-spring active:scale-95"
      >
        <Bell key={rings} className={`size-6 origin-top ${rings ? "animate-wiggle" : ""}`} strokeWidth={1.7} />
        {unread > 0 && <span className="absolute right-3.5 top-3.5 size-2.5 rounded-full bg-brand ring-2 ring-white animate-pop" />}
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.12 } }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-16 z-50 w-[min(22rem,calc(100vw-2.5rem))] card p-2"
          >
            <p className="px-3 pt-2 pb-1 text-sm font-semibold">Notifications</p>
            {items.length === 0 ? (
              <p className="px-3 py-6 text-sm text-muted">No notifications yet. You will see new responses here.</p>
            ) : (
              <ul className="max-h-96 overflow-auto">
                {items.map((n) => {
                  const isAdminNote = n.kind === "admin";
                  const href = n.kind !== "response"
                    ? n.link
                    : n.form_id
                      ? `/responses?form=${n.form_id}${n.response_id ? `&r=${n.response_id}` : ""}`
                      : "/responses";
                  const body = (
                    <>
                      {isAdminNote ? (
                        <Megaphone className={`mt-0.5 size-4 shrink-0 ${n.is_read ? "text-soft" : "text-brand"}`} aria-hidden="true" />
                      ) : (
                        <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.is_read ? "bg-line" : "bg-brand"}`} />
                      )}
                      <span className="min-w-0">
                        {n.title && <span className="block text-sm font-semibold leading-snug">{n.title}</span>}
                        <span className={`block text-sm leading-snug ${isAdminNote ? "whitespace-pre-wrap text-muted" : ""}`}>{n.message}</span>
                        <span className="text-xs text-soft">
                          {isAdminNote ? "From Formtified · " : ""}
                          {timeAgo(n.created_at)}
                        </span>
                      </span>
                    </>
                  );
                  return (
                    <li key={n.id}>
                      {href ? (
                        <Link href={href} onClick={() => setOpen(false)} className="flex gap-3 rounded-2xl px-3 py-2.5 hover:bg-canvas">
                          {body}
                        </Link>
                      ) : (
                        <div className="flex gap-3 rounded-2xl px-3 py-2.5">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
