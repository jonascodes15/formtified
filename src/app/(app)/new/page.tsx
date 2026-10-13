import { requireUser } from "@/lib/auth";
import { TEMPLATES, templateFormFields } from "@/lib/templates";
import { TopBar } from "@/components/app/TopBar";
import { TemplatesGrid } from "@/components/app/TemplatesGrid";

export const metadata = { title: "Templates" };

/** In-app template picker. `?template=<key>` (from a public template page) creates that form straight away. */
export default async function NewFormPage({ searchParams }: { searchParams: Promise<{ template?: string | string[] }> }) {
  const user = await requireUser();
  const raw = (await searchParams).template;
  const autoUse = typeof raw === "string" && TEMPLATES.some((t) => t.key === raw) ? raw : undefined;
  return (
    <>
      <TopBar name={user.name} title="Templates" back="/dashboard" />
      <p className="mt-4 max-w-xl text-muted">Ready-made onboarding forms. Using a template is free (no credits). You can edit every question after.</p>
      <TemplatesGrid
        templates={TEMPLATES.map((t) => ({ key: t.key, name: t.name, category: t.category, summary: t.summary, title: t.title, description: t.description, fields: templateFormFields(t) }))}
        autoUse={autoUse}
      />
    </>
  );
}
