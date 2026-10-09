import { requireUser } from "@/lib/auth";
import { TopBar } from "@/components/app/TopBar";
import { GenerateFlow } from "@/components/app/GenerateFlow";

export const metadata = { title: "Generate with AI" };

export default async function GeneratePage() {
  const user = await requireUser();
  return (
    <>
      <TopBar name={user.name} title="Generate with AI" back="/dashboard" />
      <GenerateFlow credits={user.credits} />
    </>
  );
}
