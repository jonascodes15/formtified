# Formtified

AI client onboarding forms for creators. You describe a client's project, the AI asks up to 4 quick questions, then it builds a form and a share link. Your client fills the form and you get the answers in your account.

## Stack (and why)

| Part | Choice | Why |
|---|---|---|
| Frontend + backend | **Next.js 16 (React + TypeScript)** | One project for the UI and the Node.js API routes. Deploys to Vercel Hobby with zero config. |
| Styling | Tailwind CSS 4 | Colours and fonts live in one file: `src/app/globals.css`. |
| Database | **Postgres (Neon, free plan)** via `@neondatabase/serverless` | Plain SQL you can read and run in Neon's SQL Editor. The HTTP driver needs no connection pool, so it suits Vercel's serverless functions. |
| AI | **Groq** free tier, model `openai/gpt-oss-20b` | Free to start, very fast (a form takes a few seconds), and costs about $0.10 per million tokens on the paid tier. |
| Auth | Email + password (bcrypt + signed cookie) | No third-party accounts needed. |
| Email | Resend (optional, free tier) | Emails you when a client submits a form. |

The AI code works with **any OpenAI-compatible provider**. If you want to switch to something else later (for example Google Gemini's free tier), change `AI_BASE_URL`, `AI_MODEL` and `AI_API_KEY`. You don't need to change any code.

## 1. Run it on your computer

You need **Node.js 20.9 or newer** (check with `node -v`). Get it from https://nodejs.org if needed.

```bash
# 1. Open the folder in VS Code, then open the terminal (Ctrl + `)
npm install

# 2. Create your settings file
cp .env.example .env.local        # Windows PowerShell: copy .env.example .env.local
```

Open `.env.local` and fill in:

1. **DATABASE_URL**: Sign up at https://neon.tech and create a project. On the project dashboard, click **Connect**, make sure **Connection pooling** is on, and copy the connection string. It looks like `postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require`. It already includes SSL (`sslmode=require`), so you don't need a certificate file.
2. **AUTH_SECRET**: Run this and paste the output:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **AI_API_KEY**: Create a free key at https://console.groq.com/keys

Then:

```bash
# 3. Create the tables in your Neon database
npm run db:setup

# 4. Start the app
npm run dev
```

Open http://localhost:3000, click **Register**, and generate your first form.

> **Prefer to do step 3 in the browser?** In the Neon console, open **SQL Editor**, paste the whole of `db/schema.sql`, and click **Run**. It's safe to run more than once.

## 2. Deploy to Vercel (Hobby, free)

1. Push the project to a GitHub repository (`.env.local` is ignored, so your secrets stay local).
2. On https://vercel.com, click **Add New → Project** and import the repo.
3. Under **Environment Variables**, add the same values as your `.env.local`, except:
   - Set `APP_URL` to your live URL, for example `https://yourdomain.com`.
   - For `DATABASE_URL`, either paste the same Neon pooled connection string, or let Vercel set it for you (see below).
4. Click **Deploy**.

**Alternative for DATABASE_URL: the Neon integration.** In your Vercel project, open **Storage** (or the **Marketplace**), choose **Neon**, and connect your Neon project. Vercel then adds `DATABASE_URL` (plus a few other `PG*` variables the app ignores) to your environment variables automatically. Redeploy afterwards so the new variable is picked up. If you use this, don't also add `DATABASE_URL` by hand.

The tables only need to be created once per database. If Vercel points at the same Neon database you used locally, you're done. If it's a new database, run `db/schema.sql` in that database's Neon SQL Editor.

### Connect your Namecheap domain

1. In Vercel, open your project, then **Settings → Domains**, and add `yourdomain.com` and `www.yourdomain.com`.
2. In Namecheap, go to **Domain List → Manage → Advanced DNS** and add the records Vercel shows you. Usually that's an `A` record `@ → 76.76.21.21` and a `CNAME` record `www → cname.vercel-dns.com`.
3. DNS changes can take anywhere from a few minutes to a few hours to go live.

## 3. Email notifications (optional)

Without `RESEND_API_KEY`, the app skips emails. You still get notifications in the app (the bell icon).

1. Sign up at https://resend.com and create an API key. Put it in `RESEND_API_KEY`.
2. In Resend, go to **Domains → Add domain** and add your domain. Then add the DNS records Resend shows you in Namecheap's **Advanced DNS**.
3. Once the domain is verified, set `EMAIL_FROM=Formtified <notifications@yourdomain.com>`.

Until the domain is verified, Resend's test sender can only email the address you signed up to Resend with.

## How the AI keeps costs down

- **Two small calls per form.** The first call returns up to 4 clarifying questions (capped at 900 tokens). The second returns the form (capped at 4,000 tokens). Users can skip the questions.
- **Compact output.** The AI replies in JSON with one-letter keys (`l` for label, `o` for options, and so on). This cuts the output by about a third. The server then expands and validates it (`src/lib/ai.ts`, `sanitizeFields` in `src/lib/forms.ts`).
- **Short "thinking".** `reasoning_effort: "low"` keeps the model from spending tokens on reasoning.
- **Credits and rate limits.** Each generated form costs 1 credit. The credit is refunded if generation fails. There's also a per-user hourly cap (`AI_HOURLY_LIMIT`).
- **Usage log.** Every AI call is logged in the `ai_usage` table with its tokens and time. To see your spend:
  `SELECT kind, COUNT(*), AVG(ms), SUM(prompt_tokens + completion_tokens) FROM ai_usage GROUP BY kind;`

**Speed:** `gpt-oss-20b` on Groq runs at roughly 1,000 tokens per second, so most forms finish in a few seconds, well under the 30-second target.

**Model changes:** Groq retires models from time to time. If generation starts failing with a model error, check https://console.groq.com/docs/models and update `AI_MODEL`.

## Project map

```
db/schema.sql                  All tables (run in Neon's SQL Editor or with npm run db:setup)
scripts/setup-db.mjs           Runs schema.sql against DATABASE_URL
src/lib/
  db.ts                        Neon Postgres queries over HTTP (no pool needed)
  auth.ts                      Sign-in cookie, getUser / requireUser
  ai.ts                        Prompts + AI calls (change prompts here)
  forms.ts                     Form queries, link (slug) creation, field validation
  templates.ts                 The 6 free templates (edit or add your own)
  email.ts                     Resend emails
src/app/
  page.tsx                     Landing page
  login/, signup/              Sign-in screen
  (app)/                       Signed-in area (sidebar on desktop, bottom nav on mobile)
    dashboard/  generate/  forms/[id]/  responses/  templates/  account/  credits/
  f/[slug]/                    The public form your clients fill
  api/                         Backend routes (auth, ai, forms, public submit, export...)
src/components/                UI pieces
```

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start locally with hot reload |
| `npm run db:setup` | Create or update the tables |
| `npm run build` | Production build (run this before pushing to catch errors) |
| `npm run lint` / `npm run typecheck` | Check code quality and types |

## Common problems

- **`DATABASE_URL is not set`**: The file must be named exactly `.env.local`. Restart `npm run dev` after editing it.
- **`password authentication failed`**: The connection string was copied wrong or the password was reset. Copy it again from Neon's **Connect** button. If you reset the password in Neon, update `.env.local` and Vercel too.
- **`relation "users" does not exist`**: The tables haven't been created yet. Run `npm run db:setup`, or paste `db/schema.sql` into Neon's SQL Editor.
- **The first request after a while is slow (1–2 seconds)**: That's normal on the free plan. Neon pauses an idle database after about 5 minutes and wakes it on the next query.
- **`npm run db:setup` says DATABASE_URL is missing**: Check that `.env.local` is in the project folder (not inside `src/`) and that the line starts with `DATABASE_URL=` with no spaces around `=`.
- **"AI is not configured"**: Add `AI_API_KEY` and restart the server.
- **"The AI is busy right now" (429)**: You've hit Groq's free-tier rate limit. Wait a minute, or add billing on Groq.

## What's next (not in v1)

- Payments for credit packs (Paystack). The Credits page already shows placeholder packs.
- Password reset by email.
- File uploads in forms (logos, reference images).
- Your own branding on public forms.
