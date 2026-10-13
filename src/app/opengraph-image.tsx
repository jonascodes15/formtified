import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Formtified: client onboarding forms for freelancers and agencies";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Client onboarding forms for freelancers",
    title: "Know exactly what your client wants to build.",
    chips: ["AI questionnaires", "26 free templates", "Share on WhatsApp"],
  });
}
