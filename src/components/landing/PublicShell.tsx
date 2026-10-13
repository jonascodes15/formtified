import { LandingNav } from "./LandingNav";
import { SiteFooter } from "./SiteFooter";

/** Frame for public pages other than the homepage (templates, privacy, terms): menu on top, footer below. */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="bg-[#e8eeeb]">
        <LandingNav />
      </div>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
