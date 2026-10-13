import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { safeNext } from "@/lib/site";
import { AuthScreen } from "@/components/landing/AuthScreen";

export const metadata = {
  title: "Create a free account",
  description: "Sign up free and get 20 AI credits to create client onboarding forms and questionnaires.",
  alternates: { canonical: "/signup" },
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const next = safeNext((await searchParams).next);
  const user = await getSessionUser();
  if (user) redirect(user.verified ? next || "/dashboard" : `/verify${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return <AuthScreen initialMode="signup" next={next ?? undefined} />;
}
