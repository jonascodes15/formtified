import { getFormBySlug } from "@/lib/forms";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "An onboarding form made with Formtified";
export const size = OG_SIZE;
export const contentType = "image/png";

/** The preview clients see when a creator shares their form link on WhatsApp or anywhere else. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const form = await getFormBySlug((await params).slug);
  if (!form) return ogCard({ eyebrow: "Formtified", title: "This form doesn't exist." });
  const questions = form.fields.filter((f) => f.type !== "section").length;
  return ogCard({
    eyebrow: `From ${form.owner_name}`,
    title: form.title,
    chips: form.status === "published" ? [`${questions} questions`, "No account needed"] : ["Closed"],
  });
}
