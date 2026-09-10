import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GoalForm } from "@/components/goals/goal-form";

export default async function NewGoalPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  return (
    <div className="flex justify-center py-6">
      <GoalForm mode="create" />
    </div>
  );
}
