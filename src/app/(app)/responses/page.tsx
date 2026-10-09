import { requireUser } from "@/lib/auth";
import { asJson, query } from "@/lib/db";
import { listForms } from "@/lib/forms";
import { TopBar } from "@/components/app/TopBar";
import { ResponsesView } from "@/components/app/ResponsesView";
import type { Answers } from "@/lib/types";

export const metadata = { title: "Responses" };

export default async function ResponsesPage({ searchParams }: { searchParams: Promise<{ form?: string; r?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const forms = await listForms(user.id);
  const formId = sp.form ? Number(sp.form) : null;
  const selected = formId && forms.some((f) => f.id === formId) ? formId : null;

  const rows = await query<{
    id: number; form_id: number; answers: unknown; respondent_name: string | null; respondent_email: string | null; is_read: boolean; created_at: Date;
  }>(
    `SELECT r.id, r.form_id, r.answers, r.respondent_name, r.respondent_email, r.is_read, r.created_at
     FROM responses r JOIN forms f ON f.id = r.form_id
     WHERE f.user_id = $1 ${selected ? "AND r.form_id = $2" : ""}
     ORDER BY r.created_at DESC LIMIT 300`,
    selected ? [user.id, selected] : [user.id],
  );

  return (
    <>
      <TopBar name={user.name} title="Responses" />
      <ResponsesView
        key={`${selected ?? "all"}-${rows.length}`}
        forms={forms.map((f) => ({ id: f.id, title: f.title, fields: f.fields, count: f.response_count ?? 0 }))}
        selectedForm={selected}
        initialOpen={sp.r ? Number(sp.r) : null}
        responses={rows.map((r) => ({
          id: r.id,
          form_id: r.form_id,
          answers: asJson<Answers>(r.answers, {}),
          name: r.respondent_name,
          email: r.respondent_email,
          is_read: r.is_read,
          created_at: new Date(r.created_at).toISOString(),
        }))}
      />
    </>
  );
}
