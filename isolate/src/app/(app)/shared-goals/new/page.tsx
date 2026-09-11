import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SharedGoalForm } from "@/components/shared-goals/shared-goal-form";

export default async function NewSharedGoalPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  return (
    <div className="flex justify-center py-6">
      <SharedGoalForm mode="create" />
    </div>
  );
}
