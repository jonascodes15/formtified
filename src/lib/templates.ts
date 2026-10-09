import type { FormField, FieldType } from "./types";

export interface Template {
  key: string;
  name: string;
  category: string;
  summary: string;
  title: string;
  description: string;
  fields: FormField[];
}

let n = 0;
const f = (type: FieldType, label: string, extra: Partial<FormField> = {}): FormField => ({
  id: `t${++n}`,
  type,
  label,
  ...(type === "section" ? {} : { required: false }),
  ...extra,
});
const req = { required: true };

const contact = (): FormField[] => [
  f("section", "About you", { help: "So we know who we are working with." }),
  f("short_text", "Full name", req),
  f("email", "Email address", req),
  f("phone", "Phone / WhatsApp number"),
  f("short_text", "Business or brand name"),
];

const budgetTimeline = (budgets: string[]): FormField[] => [
  f("section", "Budget and timeline"),
  f("single_choice", "What budget range are you working with?", { ...req, options: budgets }),
  f("date", "When do you need this completed?", { help: "Pick your ideal launch or delivery date." }),
  f("long_text", "Anything else we should know?", { placeholder: "Deadlines, concerns, past experiences with other providers..." }),
];

export const TEMPLATES: Template[] = [
  {
    key: "website",
    name: "Website project",
    category: "Web development",
    summary: "Business or portfolio websites: pages, features, content and hosting.",
    title: "Website Project Onboarding",
    description: "Tell us everything about the website you want. The more detail, the better the result.",
    fields: [
      ...contact(),
      f("section", "Your website"),
      f("url", "Current website (if any)"),
      f("long_text", "What does your business do, and who are your customers?", req),
      f("single_choice", "What is the main goal of the website?", { ...req, options: ["Get leads/enquiries", "Sell products", "Showcase work", "Share information", "Bookings"] }),
      f("multi_choice", "Which pages do you need?", { options: ["Home", "About", "Services", "Portfolio", "Blog", "Contact", "FAQ", "Pricing"] }),
      f("long_text", "List every feature you want on the website", { ...req, help: "For example: contact form, booking, live chat, payments, newsletter signup.", placeholder: "1. ...\n2. ...\n3. ..." }),
      f("section", "Content and design"),
      f("single_choice", "Do you have your content (text, images) ready?", { options: ["Yes, all of it", "Some of it", "No, I need help"] }),
      f("single_choice", "Do you have a logo and brand colours?", { options: ["Yes", "Logo only", "No"] }),
      f("long_text", "Share 2-3 websites you like and what you like about them"),
      f("single_choice", "Do you already have a domain and hosting?", { options: ["Both", "Domain only", "Neither", "Not sure"] }),
      ...budgetTimeline(["Under ₦300k", "₦300k - ₦800k", "₦800k - ₦2m", "Above ₦2m"]),
    ],
  },
  {
    key: "mobile-app",
    name: "Mobile app",
    category: "App development",
    summary: "iOS/Android apps: users, screens, features, integrations.",
    title: "Mobile App Project Onboarding",
    description: "Walk us through the app you want to build, feature by feature.",
    fields: [
      ...contact(),
      f("section", "The idea"),
      f("long_text", "Describe your app idea in a few sentences", req),
      f("long_text", "Who will use the app?", { ...req, help: "Describe your users and the problem the app solves for them." }),
      f("multi_choice", "Which platforms?", { ...req, options: ["Android", "iOS", "Web app", "Admin dashboard"] }),
      f("section", "Features"),
      f("long_text", "Walk us through every feature, screen by screen", { ...req, placeholder: "Sign up → Home → ..." }),
      f("multi_choice", "Which of these does the app need?", { options: ["User accounts", "Payments", "Push notifications", "Chat/messaging", "Maps/location", "File uploads", "Admin panel"] }),
      f("long_text", "Any apps similar to yours? What would you do differently?"),
      f("single_choice", "Do you have designs (UI/UX) already?", { options: ["Yes, complete", "Rough sketches", "No, I need design too"] }),
      ...budgetTimeline(["Under ₦1m", "₦1m - ₦3m", "₦3m - ₦7m", "Above ₦7m"]),
    ],
  },
  {
    key: "ecommerce",
    name: "E-commerce store",
    category: "Web development",
    summary: "Online stores: products, payments, delivery and store management.",
    title: "Online Store Onboarding",
    description: "Tell us about your products and how you want to sell online.",
    fields: [
      ...contact(),
      f("section", "Your products"),
      f("long_text", "What do you sell?", req),
      f("single_choice", "How many products will you list at launch?", { ...req, options: ["1-20", "21-100", "101-500", "500+"] }),
      f("single_choice", "Do products have variants (size, colour)?", { options: ["Yes", "No", "Some"] }),
      f("section", "Selling and delivery"),
      f("multi_choice", "Which payment options do you need?", { ...req, options: ["Card (Paystack/Flutterwave)", "Bank transfer", "Pay on delivery", "USSD"] }),
      f("long_text", "How do you handle delivery?", { help: "Locations you deliver to, delivery partners, pickup options." }),
      f("long_text", "List every feature you need in the store", { ...req, placeholder: "Discount codes, reviews, wishlist, order tracking..." }),
      f("url", "Link to your Instagram or current store"),
      ...budgetTimeline(["Under ₦500k", "₦500k - ₦1.5m", "₦1.5m - ₦4m", "Above ₦4m"]),
    ],
  },
  {
    key: "branding",
    name: "Brand & logo design",
    category: "Design",
    summary: "Logos and brand identity: personality, audience, colours and deliverables.",
    title: "Brand Identity Onboarding",
    description: "Help us understand your brand so we can design something that fits.",
    fields: [
      ...contact(),
      f("section", "Your brand"),
      f("long_text", "Tell us the story behind your brand", req),
      f("long_text", "Who is your target audience?", req),
      f("multi_choice", "Pick words that describe your brand's personality", { options: ["Bold", "Friendly", "Luxury", "Playful", "Minimal", "Trustworthy", "Youthful", "Traditional"] }),
      f("short_text", "Colours you love or want to avoid"),
      f("long_text", "Share brands or logos you admire and why"),
      f("section", "Deliverables"),
      f("multi_choice", "What do you need?", { ...req, options: ["Logo", "Colour palette", "Typography", "Brand guidelines", "Business cards", "Social media kit", "Packaging"] }),
      ...budgetTimeline(["Under ₦150k", "₦150k - ₦400k", "₦400k - ₦1m", "Above ₦1m"]),
    ],
  },
  {
    key: "social-media",
    name: "Social media management",
    category: "Marketing",
    summary: "Content and account management: platforms, goals, voice and approvals.",
    title: "Social Media Management Onboarding",
    description: "Share your goals and brand voice so we can plan your content.",
    fields: [
      ...contact(),
      f("section", "Your accounts"),
      f("multi_choice", "Which platforms should we manage?", { ...req, options: ["Instagram", "TikTok", "X (Twitter)", "LinkedIn", "Facebook", "YouTube"] }),
      f("long_text", "Paste links to your accounts"),
      f("long_text", "What are your goals for the next 3 months?", req),
      f("section", "Content"),
      f("long_text", "Describe your brand voice and topics you want to post about"),
      f("single_choice", "How often should we post?", { options: ["Daily", "3-5 times a week", "1-2 times a week"] }),
      f("single_choice", "Who approves posts before they go out?", { options: ["Me", "My team", "No approval needed"] }),
      ...budgetTimeline(["Under ₦100k/month", "₦100k - ₦300k/month", "₦300k - ₦700k/month", "Above ₦700k/month"]),
    ],
  },
  {
    key: "video",
    name: "Video production",
    category: "Content",
    summary: "Video shoots and editing: purpose, style, length and references.",
    title: "Video Project Onboarding",
    description: "Tell us about the video you have in mind.",
    fields: [
      ...contact(),
      f("section", "The video"),
      f("single_choice", "What type of video is this?", { ...req, options: ["Brand/promo", "Music video", "Event coverage", "YouTube content", "Ads/short-form", "Documentary"] }),
      f("long_text", "Describe the video you want, scene by scene if you can", req),
      f("single_choice", "How long should the final video be?", { options: ["Under 30 seconds", "30s - 2 min", "2 - 10 min", "Over 10 min"] }),
      f("multi_choice", "What do you need from us?", { options: ["Scriptwriting", "Shooting", "Editing only", "Motion graphics", "Voice-over", "Subtitles"] }),
      f("long_text", "Share links to videos with a style you like"),
      f("short_text", "Where will this video be published?"),
      ...budgetTimeline(["Under ₦200k", "₦200k - ₦600k", "₦600k - ₦1.5m", "Above ₦1.5m"]),
    ],
  },
];

export function getTemplate(key: string) {
  return TEMPLATES.find((t) => t.key === key) ?? null;
}
