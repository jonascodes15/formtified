import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { AuthScreen } from "@/components/landing/AuthScreen";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getUser()) redirect("/dashboard");
  return <AuthScreen initialMode="signin" />;
}
