import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { VerifyScreen } from "@/components/landing/VerifyScreen";

export const metadata = { title: "Verify your email", robots: { index: false } };

export default async function VerifyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.verified) redirect("/dashboard");
  return <VerifyScreen email={user.email} />;
}
