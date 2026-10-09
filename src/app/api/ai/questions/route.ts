import { apiUser } from "@/lib/auth";
import { fail, ok, readJson, unauthorized } from "@/lib/api";
import { AiError, askClarifyingQuestions, checkRateLimit } from "@/lib/ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return unauthorized();
  const body = await readJson<{ brief?: string }>(req);
  const brief = String(body?.brief ?? "").trim();
  if (brief.length < 15) return fail("Describe the project in a bit more detail (at least one sentence).");
  if (user.credits < 1) return fail("You are out of credits.", 402);

  try {
    await checkRateLimit(user.id);
    return ok(await askClarifyingQuestions(user.id, brief));
  } catch (e) {
    if (e instanceof AiError) return fail(e.message, e.status);
    console.error(e);
    return fail("Something went wrong. Please try again.", 500);
  }
}
