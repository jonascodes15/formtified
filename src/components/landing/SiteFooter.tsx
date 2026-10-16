import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CompanyLine } from "./CompanyLine";
import { CONTACT_EMAIL } from "@/lib/site";
import { TEMPLATES } from "@/lib/templates";

// The most-searched templates, linked from every public page so search engines find them.
const POPULAR = [
  "website-design-client-questionnaire",
  "logo-design-questionnaire",
  "graphic-design-brief",
  "social-media-client-onboarding-questionnaire",
  "wedding-photography-questionnaire",
  "event-planning-client-questionnaire",
];

export function SiteFooter() {
  const popular = POPULAR.map((k) => TEMPLATES.find((t) => t.key === k)!).filter(Boolean);
  const columns: [string, [string, string][]][] = [
    ["Product", [["Features", "/#features"], ["How it works", "/#how"], ["Pricing", "/#pricing"], ["FAQ", "/#faq"], ["Create a free account", "/signup"]]],
    ["Templates", [...popular.map((t): [string, string] => [t.seoTitle, `/templates/${t.key}`]), ["All templates →", "/templates"]]],
    ["Company", [["About us", "/about"], ["Privacy policy", "/privacy"], ["Terms of service", "/terms"], ["Contact us", `mailto:${CONTACT_EMAIL}`]]],
  ];

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr_1.4fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Client onboarding forms and questionnaires for freelancers and agencies. Know exactly what your client wants before you quote.
          </p>
        </div>
        {columns.map(([heading, links]) => (
          <nav key={heading} aria-label={heading}>
            <p className="text-sm font-semibold">{heading}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-muted hover:text-ink">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-sm text-muted md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Formtified. All rights reserved.</p>
          <CompanyLine className="text-soft" />
        </div>
      </div>
    </footer>
  );
}
