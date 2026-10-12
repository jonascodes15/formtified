import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AuthScreen } from "@/components/landing/AuthScreen";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(user.verified ? "/dashboard" : "/verify");
  return <AuthScreen initialMode="signin" />;
}
