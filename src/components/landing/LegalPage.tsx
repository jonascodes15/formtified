import { PublicShell } from "./PublicShell";

/** Layout for the privacy policy and terms: a heading, the date, and readable text. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <PublicShell>
      <section className="bg-[#e8eeeb]">
        <div className="mx-auto max-w-3xl px-5 pb-12 pt-8 sm:pt-12">
          <h1 className="display text-4xl font-semibold sm:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
        </div>
      </section>
      <article
        className="mx-auto max-w-3xl px-5 py-12 text-[16px] leading-relaxed text-ink/85
          [&_h2]:display [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink
          [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6
          [&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline [&_strong]:text-ink"
      >
        {children}
      </article>
    </PublicShell>
  );
}
