import bcrypt from "bcryptjs";
import { z } from "zod";
import { queryOne } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(190),
  password: z.string().min(8, "Password must be at least 8 characters.").max(100),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid details.");
  const { name, email, password } = parsed.data;

  const existing = await queryOne("SELECT id FROM users WHERE email = $1", [email]);
  if (existing) return fail("An account with this email already exists. Sign in instead.", 409);

  const hash = await bcrypt.hash(password, 10);
  const credits = Number(process.env.FREE_CREDITS || 20);
  const created = await queryOne<{ id: number }>(
    "INSERT INTO users (name, email, password_hash, credits) VALUES ($1, $2, $3, $4) RETURNING id",
    [name, email, hash, credits],
  );
  await createSession(created!.id);
  return ok({ ok: true });
}
