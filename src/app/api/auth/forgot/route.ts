import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api";
import { emailEnabled } from "@/lib/email";
import { sendResetLink } from "@/lib/tokens";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(190),
});

/** "Forgot password": emails a reset link. The answer is the same whether or not the account exists. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
  if (!emailEnabled()) return fail("Password reset by email isn't available yet. Please contact support.", 503);

  await sendResetLink(parsed.data.email);
  return ok();
}
