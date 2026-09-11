"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Plus, Users } from "lucide-react";

const categoryColors: Record<string, string> = {
  CAREER: "bg-blue-100 text-blue-800",
  HEALTH: "bg-green-100 text-green-800",
  FITNESS: "bg-orange-100 text-orange-800",
  FINANCE: "bg-yellow-100 text-yellow-800",
  LEARNING: "bg-purple-100 text-purple-800",
  PERSONAL: "bg-pink-100 text-pink-800",
  OTHER: "bg-gray-100 text-gray-800",
};

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  PAUSED: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-red-100 text-red-800",
};

type Goal = {
  id: string;
  title: string;
  category: string;
  status: string;
  progress: number;
  targetDate: Date | null;
  milestones: { isCompleted: boolean }[];
};

export function SharedGoalsListClient({ goals }: { goals: Goal[] }) {
  const active = goals.filter((g) => g.status !== "CANCELLED");
  const completed = goals.filter((g) => g.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shared Goals</h1>
          <p className="text-muted-foreground">
            Goals you&apos;re building together as a team
          </p>
        </div>
        <Link href="/shared-goals/new" className="shrink-0 self-start sm:self-auto">
          <Button>
            <Plus className="size-4" />
            New Shared Goal
          </Button>
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Users className="size-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No shared goals yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first shared goal to start building together.
          </p>
          <Link href="/shared-goals/new" className="mt-4">
            <Button>Create Shared Goal</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Active ({active.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((goal) => (
                  <Link key={goal.id} href={`/shared-goals/${goal.id}`}>
                    <Card className="transition-colors hover:bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium leading-tight">{goal.title}</h3>
                          <Badge variant="secondary" className={statusColors[goal.status] || ""}>
                            {goal.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <Badge variant="outline" className={`mt-2 ${categoryColors[goal.category] || ""}`}>
                          {goal.category}
                        </Badge>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="mt-1 h-2" />
                        </div>
                        {goal.milestones.length > 0 && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {goal.milestones.filter((m) => m.isCompleted).length}/
                            {goal.milestones.length} milestones
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Completed ({completed.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((goal) => (
                  <Link key={goal.id} href={`/shared-goals/${goal.id}`}>
                    <Card className="transition-colors hover:bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium leading-tight">{goal.title}</h3>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          🎉 Goal achieved!
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
