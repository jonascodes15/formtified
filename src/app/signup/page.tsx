import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { AuthScreen } from "@/components/landing/AuthScreen";

export const metadata = { title: "Create account" };

export default async function SignupPage() {
  if (await getUser()) redirect("/dashboard");
  return <AuthScreen initialMode="signup" />;
}
