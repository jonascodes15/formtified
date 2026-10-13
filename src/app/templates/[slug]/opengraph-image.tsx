import { OG_SIZE, ogCard } from "@/lib/og";
import { TEMPLATES, getTemplate, questionCount } from "@/lib/templates";

export const alt = "A free client questionnaire template from Formtified";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.key }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const t = getTemplate((await params).slug);
  if (!t) return ogCard({ eyebrow: "Free template", title: "Client questionnaire templates" });
  return ogCard({ eyebrow: `Free template · ${t.category}`, title: t.seoTitle, chips: [`${questionCount(t)} questions`, "Edit and share in minutes"] });
}
