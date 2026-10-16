-- Formtified database schema (Postgres / Neon)
-- Run it with `npm run db:setup`, or paste the whole file into Neon's SQL Editor and click Run.
-- Safe to run again: every statement uses IF NOT EXISTS / OR REPLACE.

CREATE TABLE IF NOT EXISTS users (
  id                  integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name                varchar(120) NOT NULL,
  email               varchar(190) NOT NULL,
  password_hash       varchar(100) NOT NULL,
  credits             integer NOT NULL DEFAULT 20,
  plan                varchar(20) NOT NULL DEFAULT 'free',
  email_notifications boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS forms (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug        varchar(24) NOT NULL,
  title       varchar(200) NOT NULL,
  description text NULL,
  fields      jsonb NOT NULL,
  status      varchar(12) NOT NULL DEFAULT 'published', -- 'published' | 'closed'
  source      varchar(12) NOT NULL DEFAULT 'ai',        -- 'ai' | 'template' | 'blank' | 'copy'
  brief       text NULL,                                -- the project description the user typed
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),       -- kept fresh by the trigger below
  CONSTRAINT uq_forms_slug UNIQUE (slug)
);
CREATE INDEX IF NOT EXISTS idx_forms_user ON forms (user_id, updated_at);

-- Postgres has no "ON UPDATE CURRENT_TIMESTAMP", so this trigger sets
-- forms.updated_at = now() every time a form row is updated.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_forms_updated_at ON forms;
CREATE TRIGGER trg_forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS responses (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  form_id          integer NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  answers          jsonb NOT NULL,
  respondent_name  varchar(200) NULL,
  respondent_email varchar(190) NULL,
  is_read          boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_responses_form ON responses (form_id, created_at);

CREATE TABLE IF NOT EXISTS notifications (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  form_id     integer NULL,
  response_id integer NULL,
  message     varchar(300) NOT NULL,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read, created_at);

-- One row per AI call. Used for rate limiting and to see token spend.
CREATE TABLE IF NOT EXISTS ai_usage (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind              varchar(20) NOT NULL,   -- 'questions' | 'generate'
  model             varchar(80) NOT NULL,
  prompt_tokens     integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  ms                integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage (created_at);

-- ---------- Admin dashboard (added later; safe to run on an existing database) ----------

-- Suspended users cannot sign in. last_seen_at powers "active users".
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at timestamptz NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NULL;
CREATE INDEX IF NOT EXISTS idx_users_created ON users (created_at);

-- Notifications can now also be announcements sent by an admin.
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS kind varchar(20) NOT NULL DEFAULT 'response'; -- 'response' | 'admin'
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title varchar(120) NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link varchar(300) NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS broadcast_id integer NULL;
ALTER TABLE notifications ALTER COLUMN message TYPE varchar(1000);
CREATE INDEX IF NOT EXISTS idx_notifications_broadcast ON notifications (broadcast_id);

-- One row per announcement an admin sends (to everyone, a plan, or one user).
CREATE TABLE IF NOT EXISTS broadcasts (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admin_id       integer NULL REFERENCES users(id) ON DELETE SET NULL,
  audience       varchar(20) NOT NULL,   -- 'all' | 'free' | 'paid' | 'user'
  target_user_id integer NULL REFERENCES users(id) ON DELETE SET NULL,
  title          varchar(120) NOT NULL,
  message        varchar(1000) NOT NULL,
  link           varchar(300) NULL,
  via_email      boolean NOT NULL DEFAULT false,
  recipients     integer NOT NULL DEFAULT 0,
  emails_sent    integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Site visits. No cookies: "visitor" is a hash that changes every day,
-- so people can be counted per day without storing who they are.
CREATE TABLE IF NOT EXISTS page_views (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  path       varchar(300) NOT NULL,
  referrer   varchar(200) NULL,          -- the referring site's domain only
  visitor    varchar(32) NOT NULL,
  user_id    integer NULL REFERENCES users(id) ON DELETE SET NULL,
  country    varchar(2) NULL,            -- from Vercel's location header
  device     varchar(10) NOT NULL DEFAULT 'desktop', -- 'desktop' | 'mobile' | 'tablet'
  browser    varchar(20) NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views (created_at);

-- Every action an admin takes (credits, suspensions, deletions, announcements).
CREATE TABLE IF NOT EXISTS admin_audit (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admin_id    integer NULL REFERENCES users(id) ON DELETE SET NULL,
  admin_email varchar(190) NOT NULL,
  action      varchar(40) NOT NULL,
  target      varchar(200) NULL,
  details     jsonb NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit (created_at);

-- ---------- Email verification and password reset (added later; safe to run on an existing database) ----------

-- NULL until the user enters the code emailed at signup.
-- Adding the column with DEFAULT now() marks everyone who already has an account as verified;
-- dropping the default straight after means new signups start unverified.
-- Running this again changes nothing: ADD COLUMN IF NOT EXISTS skips, so the default is not re-applied.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at timestamptz NULL DEFAULT now();
ALTER TABLE users ALTER COLUMN email_verified_at DROP DEFAULT;

-- Goes up by one when the password is reset, which signs the account out on every other device.
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version integer NOT NULL DEFAULT 0;

-- Signup codes and password-reset links. Only a hash is stored, never the code or link itself.
CREATE TABLE IF NOT EXISTS auth_tokens (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose    varchar(12) NOT NULL,          -- 'verify' | 'reset'
  token_hash varchar(64) NOT NULL,
  attempts   integer NOT NULL DEFAULT 0,    -- wrong codes typed (verify only)
  expires_at timestamptz NOT NULL,
  used_at    timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user ON auth_tokens (user_id, purpose, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_hash ON auth_tokens (token_hash);

-- ---------- File uploads, AI brief summaries and credit purchases (added later; safe to run on an existing database) ----------

-- Files clients attach to a response. The file itself lives in Vercel Blob (private); this row says whose it is.
CREATE TABLE IF NOT EXISTS uploads (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  form_id      integer NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  response_id  integer NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  field_id     varchar(40) NOT NULL,
  url          varchar(600) NOT NULL,
  pathname     varchar(400) NOT NULL,
  name         varchar(200) NOT NULL,
  size         integer NOT NULL,
  content_type varchar(120) NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_uploads_url UNIQUE (url)
);
CREATE INDEX IF NOT EXISTS idx_uploads_response ON uploads (response_id);

-- One row each time a client starts uploading a file, to cap uploads per form per hour.
CREATE TABLE IF NOT EXISTS upload_tokens (
  form_id    integer NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_upload_tokens_form ON upload_tokens (form_id, created_at);

-- The AI's one-page brief of a response, saved so it's only paid for once.
ALTER TABLE responses ADD COLUMN IF NOT EXISTS summary jsonb NULL;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS summary_at timestamptz NULL;

-- Credit packs bought through Paystack. amount is in kobo (₦1 = 100 kobo), as Paystack expects.
CREATE TABLE IF NOT EXISTS payments (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    integer NULL REFERENCES users(id) ON DELETE SET NULL,
  reference  varchar(64) NOT NULL,
  pack       varchar(20) NOT NULL,
  credits    integer NOT NULL,
  amount     integer NOT NULL,
  currency   varchar(3) NOT NULL DEFAULT 'NGN',
  status     varchar(12) NOT NULL DEFAULT 'pending', -- 'pending' | 'success' | 'failed'
  channel    varchar(30) NULL,                       -- card, bank, ussd, bank_transfer...
  paid_at    timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_payments_reference UNIQUE (reference)
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments (created_at);
