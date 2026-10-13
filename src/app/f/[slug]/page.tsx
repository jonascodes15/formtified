import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormBySlug } from "@/lib/forms";
import { FormRenderer } from "@/components/form/FormRenderer";
import { LogoMark } from "@/components/Logo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const form = await getFormBySlug((await params).slug);
  if (!form) return { title: "Form not found", robots: { index: false } };
  // Clients' forms stay out of Google, but get a proper preview when the link is shared on WhatsApp and elsewhere.
  const description = form.description?.slice(0, 200) || `Onboarding form from ${form.owner_name}. Takes a few minutes, no account needed.`;
  return {
    title: { absolute: form.title },
    description,
    robots: { index: false },
    openGraph: { type: "website", title: form.title, description, url: `/f/${form.slug}`, siteName: "Formtified" },
  };
}

export default async function PublicFormPage({ params }: Props) {
  const form = await getFormBySlug((await params).slug);
  if (!form) notFound();

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="h-40 sm:h-52 bg-forest bg-[radial-gradient(ellipse_at_top_right,rgba(201,239,107,0.25),transparent_55%)]" />
      <main className="mx-auto -mt-28 sm:-mt-36 max-w-2xl px-4 pb-16">
        <p className="mb-4 flex items-center gap-2 text-sm text-white/80">
          <span className="grid size-8 place-items-center rounded-full bg-white/15 font-medium text-white">
            {form.owner_name.slice(0, 1).toUpperCase()}
          </span>
          Sent by {form.owner_name}
        </p>
        <div className="card p-6 sm:p-10">
          {form.status !== "published" ? (
            <div className="py-10 text-center">
              <h1 className="display text-2xl font-semibold">{form.title}</h1>
              <p className="mt-2 text-muted">This form is no longer accepting responses. Please contact {form.owner_name}.</p>
            </div>
          ) : (
            <FormRenderer title={form.title} description={form.description} fields={form.fields} slug={form.slug} ownerName={form.owner_name} />
          )}
        </div>
        <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-sm text-muted hover:text-ink">
          <LogoMark className="size-5" /> Made with Formtified
        </Link>
      </main>
    </div>
  );
}
