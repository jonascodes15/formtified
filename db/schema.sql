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
