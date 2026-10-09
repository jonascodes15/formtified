import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOwnedForm } from "@/lib/forms";
import { TopBar } from "@/components/app/TopBar";
import { FormEditor } from "@/components/app/FormEditor";

export const metadata = { title: "Edit form" };

export default async function FormPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const form = await getOwnedForm(user.id, Number((await params).id));
  if (!form) notFound();

  return (
    <>
      <TopBar name={user.name} title="Edit form" back="/dashboard" />
      <FormEditor
        form={{
          id: form.id,
          slug: form.slug,
          title: form.title,
          description: form.description ?? "",
          fields: form.fields,
          status: form.status,
          responseCount: form.response_count ?? 0,
          brief: form.brief,
        }}
      />
    </>
  );
}
