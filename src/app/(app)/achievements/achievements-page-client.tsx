"use client";

import { Achievements } from "@/components/achievements";
import { UserStats } from "@/lib/achievements";

interface AchievementsPageClientProps {
  stats: UserStats;
}

export function AchievementsPageClient({ stats }: AchievementsPageClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock badges
        </p>
      </div>

      <Achievements stats={stats} />
    </div>
  );
}
