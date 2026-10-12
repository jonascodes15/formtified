import { peekResetToken } from "@/lib/tokens";
import { ResetScreen } from "@/components/landing/PasswordScreens";

export const metadata = { title: "Choose a new password", robots: { index: false }, referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const raw = (await searchParams).token;
  const token = typeof raw === "string" ? raw : "";
  // Only checks the link here; it's used up when the new password is saved.
  const valid = Boolean(await peekResetToken(token));
  return <ResetScreen token={token} valid={valid} />;
}
