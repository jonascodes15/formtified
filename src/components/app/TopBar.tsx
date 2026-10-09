import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { initials } from "@/lib/format";

/** Page header. `greeting` shows the avatar + "Hi, name" like the home mockup. */
export function TopBar({
  name,
  greeting,
  title,
  back,
}: {
  name: string;
  greeting?: boolean;
  title?: string;
  back?: string;
}) {
  return (
    <header className="flex items-center justify-between gap-4">
      {greeting ? (
        <Link href="/account" className="flex items-center gap-4 min-w-0">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-100 text-[15px] font-medium text-ink">
            {initials(name)}
          </span>
          <span className="truncate text-xl font-semibold">Hi, {name.split(" ")[0]}</span>
        </Link>
      ) : (
        <div className="flex items-center gap-3 min-w-0">
          {back && (
            <Link
              href={back}
              aria-label="Back"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-white border border-line hover:bg-brand-50"
            >
              <ArrowLeft className="size-5" />
            </Link>
          )}
          <h1 className="display truncate text-2xl sm:text-3xl font-semibold">{title}</h1>
        </div>
      )}
      <NotificationBell />
    </header>
  );
}
