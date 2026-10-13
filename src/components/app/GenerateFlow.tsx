"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, Check, Copy, ExternalLink, Pencil, RotateCcw, Sparkles, MessageCircle } from "lucide-react";
import { LogoTile } from "@/components/Logo";

interface Question {
  q: string;
  options: string[];
}

type Step = "describe" | "asking" | "questions" | "generating" | "done";

const EXAMPLES = [
  "A client wants a website for their bakery in Lekki with online ordering and delivery.",
  "A fitness coach needs a mobile app for workout plans, progress tracking and subscriptions.",
  "An estate agent wants a property listing website with search, filters and WhatsApp enquiry.",
  "A musician needs a brand identity and logo for their new album release.",
];

export function GenerateFlow({ credits: initialCredits }: { credits: number }) {
  const [step, setStep] = useState<Step>("describe");
  const [brief, setBrief] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [credits, setCredits] = useState(initialCredits);
  const [result, setResult] = useState<{ id: number; slug: string; title: string; fieldCount: number; ms: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [step]);

  useEffect(() => {
    if (step !== "generating" && step !== "asking") return;
    const start = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 250);
    return () => clearInterval(t);
  }, [step]);

  async function ask() {
    setError("");
    if (brief.trim().length < 15) {
      setError("Tell the AI a bit more about the project (at least one full sentence).");
      return;
    }
    setElapsed(0);
    setStep("asking");
    const res = await fetch("/api/ai/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setStep("describe");
      return;
    }
    if (!data.questions?.length) {
      generate([]);
      return;
    }
    setQuestions(data.questions);
    setAnswers(data.questions.map(() => ""));
    setStep("questions");
  }

  async function generate(qa: { q: string; a: string }[]) {
    setError("");
    setElapsed(0);
    setStep("generating");
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief, answers: qa }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setStep(questions.length ? "questions" : "describe");
      return;
    }
    setResult(data);
    setCredits(data.credits);
    setStep("done");
    router.refresh(); // updates the credit count in the sidebar
  }

  function reset() {
    setStep("describe");
    setBrief("");
    setQuestions([]);
    setAnswers([]);
    setResult(null);
    setError("");
  }

  const link = result ? `${typeof window !== "undefined" ? window.location.origin : ""}/f/${result.slug}` : "";

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const noCredits = credits < 1;

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      {step === "describe" ? (
        <div className="animate-rise">
          <h2 className="display text-3xl sm:text-4xl font-semibold leading-tight">What is your client building?</h2>
          <p className="mt-2 text-muted">
            Describe the project in your own words. The AI asks a few quick questions, then builds a form your client fills to explain every feature.
          </p>

          <div className="card mt-6 p-2 focus-within:border-brand">
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask();
              }}
              rows={5}
              maxLength={2000}
              autoFocus
              placeholder="e.g. A client wants an e-commerce website for their fashion brand. They sell ready-to-wear and want payments, delivery tracking and a lookbook..."
              className="w-full resize-none rounded-2xl bg-transparent p-4 text-[16px] leading-relaxed outline-none placeholder:text-soft"
            />
            <div className="flex items-center justify-between gap-3 px-3 pb-2">
              <span className="text-xs text-soft">{brief.length}/2000 · uses 1 credit · {credits} left</span>
              <button onClick={ask} disabled={noCredits || !brief.trim()} className="btn-primary" aria-label="Continue">
                Continue <ArrowUp className="size-4 rotate-45" />
              </button>
            </div>
          </div>

          {noCredits && (
            <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You are out of credits. <Link href="/credits" className="font-semibold underline">Get more credits</Link> or{" "}
              <Link href="/new" className="font-semibold underline">start from a free template</Link>.
            </p>
          )}
          {error && <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <p className="mt-8 text-sm font-medium text-muted">Try an example</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => setBrief(ex)} className="card rounded-2xl p-4 text-left text-sm leading-snug text-ink hover:border-brand/50">
                {ex}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Creator's brief */}
          <div className="flex justify-end animate-rise">
            <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-forest px-5 py-4 text-[15px] leading-relaxed text-white whitespace-pre-wrap">{brief}</div>
          </div>

          {step === "asking" && <AiBubble><Thinking label="Reading your description" seconds={elapsed} /></AiBubble>}

          {(step === "questions" || (step === "generating" && questions.length > 0) || (step === "done" && questions.length > 0)) && (
            <AiBubble>
              <p className="text-[15px]">A few quick questions so the form fits this project. Tap a suggestion or type your own answer.</p>
              <div className="mt-4 space-y-5">
                {questions.map((q, i) => (
                  <div key={i}>
                    <p className="font-semibold leading-snug">{i + 1}. {q.q}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {q.options.map((o) => {
                        const on = answers[i] === o;
                        return (
                          <button
                            key={o}
                            disabled={step !== "questions"}
                            onClick={() => setAnswers((a) => a.map((v, j) => (j === i ? (on ? "" : o) : v)))}
                            className={`chip ${on ? "border-brand bg-brand text-white hover:bg-brand-600" : ""}`}
                          >
                            {on && <Check className="size-3.5" />} {o}
                          </button>
                        );
                      })}
                    </div>
                    {step === "questions" && (
                      <input
                        value={q.options.includes(answers[i]) ? "" : answers[i]}
                        onChange={(e) => setAnswers((a) => a.map((v, j) => (j === i ? e.target.value : v)))}
                        placeholder="Or type your answer"
                        className="input mt-2 h-10 rounded-xl text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
              {step === "questions" && (
                <div className="mt-6 flex flex-wrap gap-2">
                  <button onClick={() => generate(questions.map((q, i) => ({ q: q.q, a: answers[i] })))} className="btn-primary">
                    <Sparkles className="size-4" /> Generate form
                  </button>
                  <button onClick={() => generate([])} className="btn-ghost">Skip questions</button>
                </div>
              )}
              {error && <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            </AiBubble>
          )}

          {step === "generating" && <AiBubble><Thinking label="Building your form" seconds={elapsed} /></AiBubble>}

          {step === "done" && result && (
            <AiBubble>
              <p className="flex items-center gap-2 text-[15px] font-semibold text-brand-700">
                <Check className="size-5" /> Your form is ready
              </p>
              <p className="display mt-2 text-2xl font-semibold leading-tight">{result.title}</p>
              <p className="mt-1 text-sm text-muted">
                {result.fieldCount} fields · built in {(result.ms / 1000).toFixed(1)}s · {credits} credits left
              </p>

              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-line bg-canvas p-1.5 pl-4">
                <span className="min-w-0 flex-1 truncate text-sm">{link}</span>
                <button onClick={copy} className="btn-primary h-10 px-4">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy link"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/forms/${result.id}`} className="btn-dark"><Pencil className="size-4" /> Review & edit</Link>
                <a href={`/f/${result.slug}`} target="_blank" className="btn-ghost"><ExternalLink className="size-4" /> Preview</a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Hi! Please fill this form so I understand everything you want for your project: ${link}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  <MessageCircle className="size-4" /> Send on WhatsApp
                </a>
              </div>
              <button onClick={reset} className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
                <RotateCcw className="size-4" /> Generate another form
              </button>
            </AiBubble>
          )}
          <div ref={bottom} />
        </div>
      )}
    </div>
  );
}

function AiBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 animate-rise">
      <LogoTile className="size-9" />
      <div className="card min-w-0 flex-1 rounded-3xl rounded-tl-lg p-5">{children}</div>
    </div>
  );
}

function Thinking({ label, seconds }: { label: string; seconds: number }) {
  return (
    <div className="flex items-center gap-3 text-[15px] text-muted">
      <span className="dot-typing inline-flex gap-1 text-brand"><span /><span /><span /></span>
      {label}… <span className="tabular-nums text-soft">{seconds}s</span>
    </div>
  );
}
