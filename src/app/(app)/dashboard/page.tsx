import Link from "next/link";
import { ArrowUpRight, FileText, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listForms } from "@/lib/forms";
import { TopBar } from "@/components/app/TopBar";
import { FormsList } from "@/components/app/FormsList";

export const metadata = { title: "Your forms" };

export default async function DashboardPage() {
  const user = await requireUser();
  const forms = await listForms(user.id);

  return (
    <>
      <TopBar name={user.name} greeting />

      <h1 className="display mt-10 text-[40px] leading-[1.12] font-semibold sm:text-5xl">
        How may I help
        <br />
        you today?
      </h1>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
        <Link
          href="/generate"
          className="group relative row-span-2 flex min-h-[19rem] flex-col justify-end overflow-hidden rounded-[2rem] bg-brand p-5 sm:p-8 text-white transition duration-300 ease-spring hover:bg-brand-600 hover:shadow-[var(--shadow-lift)] active:scale-[0.98]"
        >
          <ArrowUpRight className="absolute right-6 top-6 size-6 transition duration-300 ease-spring group-hover:translate-x-1 group-hover:-translate-y-1" />
          <div className="absolute left-1/2 top-[40%] size-28 -translate-x-1/2 -translate-y-1/2 sm:size-40">
            <div className="absolute bottom-0 right-0 size-20 rounded-lg border-[3px] border-dashed border-white/90 sm:size-28" />
            <div className="absolute left-0 top-0 grid size-20 place-items-center rounded-2xl bg-white sm:size-28">
              <svg viewBox="0 0 24 24" className="ml-7 mt-7 size-7 text-brand sm:ml-10 sm:mt-10 sm:size-9" aria-hidden="true">
                <path fill="currentColor" d="M12 2l2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3z" />
              </svg>
            </div>
          </div>
          <span className="display text-[24px] leading-tight font-semibold sm:text-4xl">
            Generate form
            <br />
            with AI
          </span>
        </Link>

        <Link href="/new" className="group card card-hover relative flex flex-col justify-between rounded-[2rem] p-5 sm:p-7 bg-gradient-to-br from-white to-brand-50/60 hover:border-brand/40 active:scale-[0.98]">
          <span className="grid size-14 sm:size-16 place-items-center rounded-full bg-brand-50">
            <FileText className="size-6 sm:size-7" strokeWidth={1.7} />
          </span>
          <ArrowUpRight className="absolute right-6 top-8 size-6 transition duration-300 ease-spring group-hover:translate-x-1 group-hover:-translate-y-1" />
          <span className="mt-6 text-base sm:text-lg font-semibold leading-snug">Start from template</span>
        </Link>

        <Link href="/credits" className="group card card-hover relative flex flex-col justify-between rounded-[2rem] p-5 sm:p-7 bg-gradient-to-br from-white to-brand-50/60 hover:border-brand/40 active:scale-[0.98]">
          <span className="grid size-14 sm:size-16 place-items-center rounded-full bg-brand-50">
            <Wallet className="size-6 sm:size-7" strokeWidth={1.7} />
          </span>
          <ArrowUpRight className="absolute right-6 top-8 size-6 transition duration-300 ease-spring group-hover:translate-x-1 group-hover:-translate-y-1" />
          <span className="mt-6">
            <span className="block text-base sm:text-lg font-semibold leading-snug">Add more credits</span>
            <span className="text-sm text-muted">{user.credits} available</span>
          </span>
        </Link>
      </section>

      <FormsList forms={forms.map((f) => ({ id: f.id, slug: f.slug, title: f.title, status: f.status, updated_at: new Date(f.updated_at).toISOString(), response_count: f.response_count ?? 0 }))} />
    </>
  );
}
