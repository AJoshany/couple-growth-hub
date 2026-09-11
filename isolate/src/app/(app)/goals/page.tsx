import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GoalCard } from "@/components/goals/goal-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Target, Plus } from "lucide-react";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    include: { milestones: { select: { isCompleted: true } } },
    orderBy: { createdAt: "desc" },
  });

  const activeGoals = goals.filter((g) => g.status !== "CANCELLED");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Goals</h1>
          <p className="text-muted-foreground">
            Track your personal growth and achievements
          </p>
        </div>
        <Link href="/goals/new">
          <Button>
            <Plus className="size-4" />
            New Goal
          </Button>
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Target className="size-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No goals yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first goal to start tracking your progress.
          </p>
          <Link href="/goals/new" className="mt-4">
            <Button>Create Goal</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {activeGoals.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Active ({activeGoals.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {activeGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Completed ({completedGoals.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {completedGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
