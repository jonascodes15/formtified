import { requireUser } from "@/lib/auth";
import { TEMPLATES } from "@/lib/templates";
import { TopBar } from "@/components/app/TopBar";
import { TemplatesGrid } from "@/components/app/TemplatesGrid";

export const metadata = { title: "Templates" };

export default async function TemplatesPage() {
  const user = await requireUser();
  return (
    <>
      <TopBar name={user.name} title="Templates" back="/dashboard" />
      <p className="mt-4 max-w-xl text-muted">Ready-made onboarding forms. Using a template is free (no credits). You can edit every question after.</p>
      <TemplatesGrid templates={TEMPLATES} />
    </>
  );
}
