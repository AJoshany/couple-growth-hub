"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  achievements as allAchievements,
  calculateAchievements,
  getUnlockedCount,
  getProgress,
  UserStats,
  Achievement,
} from "@/lib/achievements";
import { Trophy, Lock, Check } from "lucide-react";

interface AchievementsProps {
  stats?: UserStats;
}

export function Achievements({ stats }: AchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (stats) {
      const calculated = calculateAchievements(stats);
      setAchievements(calculated);
    }
    setLoading(false);
  }, [stats]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <LoadingSpinner size="md" />
        </CardContent>
      </Card>
    );
  }

  const unlockedCount = getUnlockedCount(achievements);
  const progress = getProgress(achievements);

  const categories = [
    { value: "goals", label: "Goals", icon: "🎯" },
    { value: "journal", label: "Journal", icon: "📖" },
    { value: "habits", label: "Habits", icon: "✅" },
    { value: "relationship", label: "Relationship", icon: "💕" },
    { value: "special", label: "Special", icon: "⭐" },
  ];

  const filteredAchievements = selectedCategory
    ? achievements.filter((a) => a.category === selectedCategory)
    : achievements;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-4 text-yellow-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">
                {unlockedCount} of {achievements.length} unlocked
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`relative rounded-lg border p-3 text-center transition-all ${
                achievement.unlocked
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/30 opacity-60"
              }`}
            >
              {achievement.unlocked ? (
                <div className="absolute top-2 right-2">
                  <Check className="size-3 text-green-500" />
                </div>
              ) : (
                <div className="absolute top-2 right-2">
                  <Lock className="size-3 text-muted-foreground" />
                </div>
              )}
              <span className="text-2xl">{achievement.icon}</span>
              <p className="mt-2 text-sm font-medium">{achievement.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
