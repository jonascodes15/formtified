import Link from "next/link";
import Form from "next/form";
import { ExternalLink, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listAllForms } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { Badge, PageHeader, Pagination, param } from "@/components/admin/ui";
import { FormActions } from "@/components/admin/FormActions";

export const metadata = { title: "Forms" };

export default async function AdminFormsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const filters = { q: param(sp, "q"), status: param(sp, "status"), source: param(sp, "source") };
  const page = Number(param(sp, "page")) || 1;
  const { rows, total, pageSize } = await listAllForms({ ...filters, page });

  return (
    <>
      <PageHeader title="Forms" description={`Every form on the platform · ${total.toLocaleString("en-US")} match.`} />

      <Form action="/admin/forms" className="mt-6 flex flex-col gap-2 sm:flex-row">
        <label className="input flex flex-1 items-center gap-2">
          <Search className="size-4 text-muted" />
          <input name="q" defaultValue={filters.q} placeholder="Search title, owner name or email" className="w-full bg-transparent outline-none" />
        </label>
        <select name="status" defaultValue={filters.status ?? ""} className="input sm:w-44 cursor-pointer" aria-label="Status">
          <option value="">Any status</option>
          <option value="published">Accepting responses</option>
          <option value="closed">Closed</option>
        </select>
        <select name="source" defaultValue={filters.source ?? ""} className="input sm:w-40 cursor-pointer" aria-label="Created from">
          <option value="">Any source</option>
          <option value="ai">AI</option>
          <option value="template">Template</option>
          <option value="blank">Blank</option>
          <option value="copy">Copy</option>
        </select>
        <button className="btn-dark h-12">Apply</button>
      </Form>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Form</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Owner</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Source</th>
              <th className="hidden px-4 py-3 font-medium text-right lg:table-cell">Questions</th>
              <th className="px-4 py-3 font-medium text-right">Responses</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Created</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted">No forms match these filters.</td>
              </tr>
            )}
            {rows.map((f) => (
              <tr key={f.id} className="hover:bg-canvas/60">
                <td className="px-4 py-3">
                  <a href={`/f/${f.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-64 items-center gap-1.5 font-medium hover:underline">
                    <span className="truncate">{f.title}</span> <ExternalLink className="size-3.5 shrink-0 text-muted" />
                  </a>
                  <Link href={`/admin/users/${f.user_id}`} className="block max-w-64 truncate text-xs text-muted hover:underline md:hidden">{f.owner_email}</Link>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <Link href={`/admin/users/${f.user_id}`} className="block max-w-52 truncate hover:underline">{f.owner_name}</Link>
                  <span className="block max-w-52 truncate text-xs text-muted">{f.owner_email}</span>
                </td>
                <td className="hidden px-4 py-3 capitalize text-muted sm:table-cell">{f.source}</td>
                <td className="hidden px-4 py-3 text-right tabular-nums lg:table-cell">{f.questions}</td>
                <td className="px-4 py-3 text-right tabular-nums">{f.responses}</td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-muted lg:table-cell">{formatDate(f.created_at)}</td>
                <td className="px-4 py-3">{f.status === "closed" ? <Badge>Closed</Badge> : <Badge tone="green">Open</Badge>}</td>
                <td className="px-2 py-3"><FormActions id={f.id} title={f.title} status={f.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={pageSize} total={total} basePath="/admin/forms" params={filters} />
    </>
  );
}
