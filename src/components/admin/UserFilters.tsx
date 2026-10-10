import Form from "next/form";
import { Search } from "lucide-react";
import { PLANS } from "@/lib/types";

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const ALL_PLAN_OPTIONS = [
  { value: "", label: "All plans" },
  { value: "paid", label: "Paid (any)" },
  ...PLANS.map((p) => ({ value: p, label: cap(p) })),
];

/** Search + filters. Submitting updates the URL, so a filtered view can be bookmarked or shared. */
export function UserFilters({
  action,
  values,
  planOptions = ALL_PLAN_OPTIONS,
}: {
  action: string;
  values: Record<string, string | undefined>;
  planOptions?: { value: string; label: string }[];
}) {
  return (
    <Form action={action} className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <label className="input flex flex-1 items-center gap-2 sm:min-w-64">
        <Search className="size-4 text-muted" />
        <input name="q" defaultValue={values.q} placeholder="Search name or email" className="w-full bg-transparent outline-none" />
      </label>
      <select name="plan" defaultValue={values.plan ?? ""} className="input sm:w-40 cursor-pointer" aria-label="Plan">
        {planOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <select name="status" defaultValue={values.status ?? ""} className="input sm:w-40 cursor-pointer" aria-label="Status">
        <option value="">Any status</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
      </select>
      <select name="sort" defaultValue={values.sort ?? "newest"} className="input sm:w-44 cursor-pointer" aria-label="Sort">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="active">Recently active</option>
        <option value="forms">Most forms</option>
        <option value="credits">Most credits</option>
      </select>
      <button className="btn-dark h-12">Apply</button>
    </Form>
  );
}
