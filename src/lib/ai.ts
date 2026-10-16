import "server-only";
import { execute, queryOne } from "./db";
import { sanitizeFields } from "./forms";
import type { BriefSummary, FormField } from "./types";

/**
 * Works with any OpenAI-compatible chat API.
 * Default: Groq free tier + openai/gpt-oss-20b (very fast, very cheap).
 * Swap provider by changing AI_BASE_URL / AI_MODEL / AI_API_KEY in .env.local.
 */
const BASE_URL = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
const MODEL = process.env.AI_MODEL || "openai/gpt-oss-20b";
const API_KEY = process.env.AI_API_KEY || process.env.GROQ_API_KEY || "";
const HOURLY_LIMIT = Number(process.env.AI_HOURLY_LIMIT || 20);

export class AiError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
  }
}

interface ChatResult {
  json: unknown;
  promptTokens: number;
  completionTokens: number;
  ms: number;
}

async function chatJson(system: string, user: string, maxTokens: number): Promise<ChatResult> {
  if (!API_KEY) throw new AiError("AI is not configured. Add AI_API_KEY to your environment (see README).", 500);

  const base: Record<string, unknown> = {
    model: MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.4,
    max_completion_tokens: maxTokens,
    response_format: { type: "json_object" },
  };
  // gpt-oss models "think" before answering. Keep that short to save tokens and time.
  const extras: Record<string, unknown> = MODEL.includes("gpt-oss") ? { reasoning_effort: "low" } : {};

  const started = Date.now();
  let res = await callApi({ ...base, ...extras });
  // Some providers reject optional params. Retry once with the plain request.
  if (res.status === 400 && Object.keys(extras).length) res = await callApi(base);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new AiError("The AI is busy right now. Please try again in a minute.", 429);
    console.error("AI error", res.status, text.slice(0, 500));
    throw new AiError("The AI could not respond. Please try again.");
  }
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  return {
    json: parseJsonLoose(content),
    promptTokens: data?.usage?.prompt_tokens ?? 0,
    completionTokens: data?.usage?.completion_tokens ?? 0,
    ms: Date.now() - started,
  };
}

function callApi(body: Record<string, unknown>) {
  return fetch(`${BASE_URL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(28_000),
  }).catch((e) => {
    throw new AiError(e?.name === "TimeoutError" ? "The AI took too long. Please try again." : "Could not reach the AI service.");
  });
}

function parseJsonLoose(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {}
    }
    throw new AiError("The AI returned an unreadable answer. Please try again.");
  }
}

async function logUsage(userId: number, kind: string, r: ChatResult) {
  await execute(
    "INSERT INTO ai_usage (user_id, kind, model, prompt_tokens, completion_tokens, ms) VALUES ($1, $2, $3, $4, $5, $6)",
    [userId, kind, MODEL, r.promptTokens, r.completionTokens, r.ms],
  ).catch((e) => console.error("ai_usage log failed", e));
}

export async function checkRateLimit(userId: number) {
  // COUNT(*) comes back from Postgres as a string, hence Number() below.
  const row = await queryOne<{ n: string }>(
    "SELECT COUNT(*) AS n FROM ai_usage WHERE user_id = $1 AND created_at > now() - interval '1 hour'",
    [userId],
  );
  if (Number(row?.n ?? 0) >= HOURLY_LIMIT) {
    throw new AiError("You have reached the hourly AI limit. Please try again later.", 429);
  }
}

// ---------- Step 1: a few clarifying questions ----------

const QUESTIONS_PROMPT = `You help a freelancer or creator build an onboarding form that their client fills to describe a project in detail.
Read the creator's description and ask 3 short clarifying questions (never more than 4) whose answers change what the form should ask the client.
Good topics: type of deliverable, must-have sections of the form, whether to ask about budget/timeline, tone.
Each question gets 2-4 short suggested answers (under 6 words each).
Reply with JSON only: {"title":"short form title","questions":[{"q":"question","options":["a","b"]}]}`;

export interface ClarifyingQuestion {
  q: string;
  options: string[];
}

export async function askClarifyingQuestions(userId: number, brief: string) {
  const r = await chatJson(QUESTIONS_PROMPT, brief.slice(0, 2000), 900);
  await logUsage(userId, "questions", r);
  const obj = (r.json ?? {}) as { title?: unknown; questions?: unknown };
  const questions: ClarifyingQuestion[] = (Array.isArray(obj.questions) ? obj.questions : [])
    .map((q: { q?: unknown; question?: unknown; options?: unknown }) => ({
      q: String(q?.q ?? q?.question ?? "").trim().slice(0, 200),
      options: (Array.isArray(q?.options) ? q.options : []).map((o: unknown) => String(o).trim().slice(0, 60)).filter(Boolean).slice(0, 4),
    }))
    .filter((q) => q.q)
    .slice(0, 4);
  return { title: typeof obj.title === "string" ? obj.title.slice(0, 120) : "", questions, ms: r.ms };
}

// ---------- Step 2: generate the form ----------

// Short keys (t, d, f, y, l, h, p, r, o) cut the output size by about a third,
// which makes generation faster and cheaper.
const GENERATE_PROMPT = `You write client onboarding forms for freelancers and creators (web developers, designers, video editors, etc.).
The creator sends the form as a link. Their client fills it and narrates every detail of the project they want built.
Rules:
- 12 to 24 fields. Group them with "section" fields (3 to 6 sections).
- First section collects the client's contact details: full name (short_text), email (email), and optionally phone/company.
- Speak to the client as "you". Keep labels short and clear. Use "h" for a one-line hint when it helps.
- Use long_text where the client should narrate features, goals, users, or examples. Ask them to list every feature.
- Choice fields (single_choice, multi_choice, dropdown) must include "o" with 2-8 options.
- Mark essentials required ("r":true). Budget and timeline questions use ranges as options when relevant.
- Add one "file" field when the client may have files to share (logo, brand assets, photos, documents, examples). Never more than 2.
Types: section, short_text, long_text, email, phone, url, number, date, single_choice, multi_choice, dropdown, file.
Reply with JSON only:
{"t":"form title","d":"one friendly sentence for the client","f":[{"y":"type","l":"label","h":"hint","p":"placeholder","r":true,"o":["option"]}]}`;

export async function generateForm(userId: number, brief: string, answers: { q: string; a: string }[]) {
  const qa = answers
    .filter((x) => x.a?.trim())
    .map((x) => `Q: ${x.q.slice(0, 200)}\nA: ${x.a.slice(0, 300)}`)
    .join("\n");
  const userMsg = `Creator's description:\n${brief.slice(0, 2000)}${qa ? `\n\nClarifications:\n${qa}` : ""}`;

  const r = await chatJson(GENERATE_PROMPT, userMsg, 4000);
  await logUsage(userId, "generate", r);

  const obj = (r.json ?? {}) as { t?: unknown; d?: unknown; f?: unknown; title?: unknown; description?: unknown; fields?: unknown };
  const rawFields = Array.isArray(obj.f) ? obj.f : Array.isArray(obj.fields) ? obj.fields : [];
  const fields: FormField[] = sanitizeFields(
    rawFields.map((x: Record<string, unknown>) => ({
      type: x.y ?? x.type,
      label: x.l ?? x.label,
      help: x.h ?? x.help ?? undefined,
      placeholder: x.p ?? x.placeholder ?? undefined,
      required: Boolean(x.r ?? x.required),
      options: x.o ?? x.options ?? undefined,
    })),
  );
  if (fields.filter((f) => f.type !== "section").length < 3) {
    throw new AiError("The AI returned an incomplete form. Please try again.");
  }
  const title = String(obj.t ?? obj.title ?? "Client onboarding form").trim().slice(0, 200) || "Client onboarding form";
  const description = String(obj.d ?? obj.description ?? "").trim().slice(0, 500) || null;
  return { title, description, fields, ms: r.ms };
}

// ---------- Brief summary of a client's response ----------

const SUMMARY_PROMPT = `You turn a client's answers to an onboarding form into a one-page project brief for the freelancer who sent the form.
Rules:
- Use only what the client wrote. Never invent facts, features, prices, names or dates.
- Write budgets, prices and dates exactly as the client wrote them. If the client didn't give one, use "".
- Plain English, short sentences, no marketing language. Speak about "the client".
- "missing": questions the freelancer should ask before quoting, because an answer is missing, vague or contradictory.
- "risks": things that could cause trouble (tight deadline vs big scope, unclear budget, missing content, dependencies). Empty if none.
Reply with JSON only:
{"overview":"2-3 sentences: who the client is and what they want","goals":["what success looks like"],"scope":["each deliverable, page or feature"],"budget":"","timeline":"","notes":["style, examples, preferences, constraints"],"risks":[""],"missing":["question for the client"]}`;

const LIMITS = { goals: 6, scope: 14, notes: 8, risks: 5, missing: 6 } as const;

export async function summarizeResponse(
  userId: number,
  form: { title: string; fields: FormField[] },
  answers: Record<string, string | string[]>,
): Promise<BriefSummary> {
  const lines = [`Form: ${form.title}`];
  for (const f of form.fields) {
    if (f.type === "section") {
      lines.push(`\n## ${f.label}`);
      continue;
    }
    const a = answers[f.id];
    const text = Array.isArray(a) ? a.join(", ") : (a ?? "");
    lines.push(`Q: ${f.label}\nA: ${f.type === "file" && text ? `(attached files) ${text}` : text.slice(0, 1500) || "(no answer)"}`);
  }
  const r = await chatJson(SUMMARY_PROMPT, lines.join("\n").slice(0, 14000), 2500);
  await logUsage(userId, "summary", r);

  const obj = (r.json ?? {}) as Record<string, unknown>;
  const str = (v: unknown, max = 400) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const list = (v: unknown, max: number) =>
    (Array.isArray(v) ? v : []).map((x) => str(x, 300)).filter(Boolean).slice(0, max);
  const summary: BriefSummary = {
    overview: str(obj.overview, 900),
    goals: list(obj.goals, LIMITS.goals),
    scope: list(obj.scope, LIMITS.scope),
    budget: str(obj.budget, 200),
    timeline: str(obj.timeline, 200),
    notes: list(obj.notes, LIMITS.notes),
    risks: list(obj.risks, LIMITS.risks),
    missing: list(obj.missing, LIMITS.missing),
  };
  if (!summary.overview && !summary.scope.length) throw new AiError("The AI returned an empty brief. Please try again.");
  return summary;
}
