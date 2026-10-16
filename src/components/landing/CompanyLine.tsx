import { COMPANY, CONTACT_EMAIL } from "@/lib/site";

/** "Weblanda Technologies Ltd · RC 9902017 · Lagos, Nigeria · support@…", as one line. */
export function CompanyLine({ className = "" }: { className?: string }) {
  return (
    <p className={className}>
      {COMPANY.name} · {COMPANY.rc} · {COMPANY.location} ·{" "}
      <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-ink">{CONTACT_EMAIL}</a>
    </p>
  );
}
