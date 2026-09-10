"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    category: string;
    status: string;
    progress: number;
    targetDate: Date | null;
    milestones: { isCompleted: boolean }[];
  };
}

export function GoalCard({ goal }: GoalCardProps) {
  const completedMilestones = goal.milestones.filter((m) => m.isCompleted).length;
  const totalMilestones = goal.milestones.length;

  return (
    <Link href={`/goals/${goal.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium leading-tight">{goal.title}</h3>
            <Badge
              variant="secondary"
              className={statusColors[goal.status] || ""}
            >
              {goal.status.replace(/_/g, " ")}
            </Badge>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className={categoryColors[goal.category] || ""}>
              {goal.category}
            </Badge>
            {totalMilestones > 0 && (
              <span className="text-xs text-muted-foreground">
                {completedMilestones}/{totalMilestones} milestones
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="mt-1 h-2" />
          </div>

          {goal.targetDate && (
            <p className="mt-2 text-xs text-muted-foreground">
              Target:{" "}
              {new Date(goal.targetDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
