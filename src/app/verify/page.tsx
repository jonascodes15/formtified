import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { safeNext } from "@/lib/site";
import { VerifyScreen } from "@/components/landing/VerifyScreen";

export const metadata = { title: "Verify your email", robots: { index: false } };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const next = safeNext((await searchParams).next);
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.verified) redirect(next || "/dashboard");
  return <VerifyScreen email={user.email} next={next ?? undefined} />;
}
