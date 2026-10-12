import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AuthScreen } from "@/components/landing/AuthScreen";

export const metadata = { title: "Create account" };

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect(user.verified ? "/dashboard" : "/verify");
  return <AuthScreen initialMode="signup" />;
}
