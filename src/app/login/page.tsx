import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { safeNext } from "@/lib/site";
import { AuthScreen } from "@/components/landing/AuthScreen";

export const metadata = { title: "Sign in", alternates: { canonical: "/login" } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const next = safeNext((await searchParams).next);
  const user = await getSessionUser();
  if (user) redirect(user.verified ? next || "/dashboard" : `/verify${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return <AuthScreen initialMode="signin" next={next ?? undefined} />;
}
