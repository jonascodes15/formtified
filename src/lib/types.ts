export const FIELD_TYPES = [
  "section",
  "short_text",
  "long_text",
  "email",
  "phone",
  "url",
  "number",
  "date",
  "single_choice",
  "multi_choice",
  "dropdown",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_LABELS: Record<FieldType, string> = {
  section: "Section heading",
  short_text: "Short answer",
  long_text: "Paragraph",
  email: "Email",
  phone: "Phone",
  url: "Website link",
  number: "Number",
  date: "Date",
  single_choice: "Multiple choice (one)",
  multi_choice: "Checkboxes (many)",
  dropdown: "Dropdown",
};

export const CHOICE_TYPES: FieldType[] = ["single_choice", "multi_choice", "dropdown"];

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface FormRecord {
  id: number;
  user_id: number;
  slug: string;
  title: string;
  description: string | null;
  fields: FormField[];
  status: "published" | "closed";
  source: string;
  brief: string | null;
  created_at: Date;
  updated_at: Date;
  response_count?: number;
}

export type Answers = Record<string, string | string[]>;

export interface ResponseRecord {
  id: number;
  form_id: number;
  answers: Answers;
  respondent_name: string | null;
  respondent_email: string | null;
  is_read: boolean;
  created_at: Date;
  form_title?: string;
}

/** Plan names. Everything except "free" counts as a paying subscriber in the admin dashboard. */
export const PLANS = ["free", "starter", "pro", "studio"] as const;
export type Plan = (typeof PLANS)[number];

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  credits: number;
  plan: string;
  email_notifications: boolean;
}
