/**
 * What things cost in credits, and the credit packs sold through Paystack.
 * Change prices here: the credits page, homepage and checkout all read from this file.
 */

/** Credits used by one AI-written form. */
export const FORM_COST = 1;
/** Credits used by one AI brief summary of a response (viewing a saved summary again is free). */
export const SUMMARY_COST = 1;

export interface CreditPack {
  id: "starter" | "pro" | "studio";
  name: string;
  credits: number;
  /** Price in Naira. */
  naira: number;
  note: string;
  featured?: boolean;
}

export const PACKS: CreditPack[] = [
  { id: "starter", name: "Starter", credits: 30, naira: 2500, note: "Good for a few clients a month" },
  { id: "pro", name: "Pro", credits: 120, naira: 7500, note: "For busy freelancers", featured: true },
  { id: "studio", name: "Studio", credits: 400, naira: 20000, note: "For agencies and teams" },
];

export const getPack = (id: unknown) => PACKS.find((p) => p.id === id) ?? null;

export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
