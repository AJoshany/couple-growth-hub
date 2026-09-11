"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateHealthScore, getGradeColor, getScoreColor } from "@/lib/health-score";
import { Heart, BookOpen, Calendar, Target, MessageCircle } from "lucide-react";

interface RelationshipHealthProps {
  journalEntriesThisWeek?: number;
  datesThisMonth?: number;
  avgMood?: number;
  sharedGoalsProgress?: number;
  loveNotesThisWeek?: number;
}

export function RelationshipHealth({
  journalEntriesThisWeek = 0,
  datesThisMonth = 0,
  avgMood = 3,
  sharedGoalsProgress = 0,
  loveNotesThisWeek = 0,
}: RelationshipHealthProps) {
  const [healthScore, setHealthScore] = useState<ReturnType<typeof calculateHealthScore> | null>(null);

  useEffect(() => {
    const score = calculateHealthScore(
      journalEntriesThisWeek,
      datesThisMonth,
      avgMood,
      sharedGoalsProgress,
      loveNotesThisWeek
    );
    setHealthScore(score);
  }, [
    journalEntriesThisWeek,
    datesThisMonth,
    avgMood,
    sharedGoalsProgress,
    loveNotesThisWeek,
  ]);

  if (!healthScore) return null;

  const factors = [
    {
      label: "Journal Together",
      value: healthScore.factors.journalConsistency,
      icon: BookOpen,
      description: "Weekly journal entries",
    },
    {
      label: "Date Nights",
      value: healthScore.factors.dateFrequency,
      icon: Calendar,
      description: "Monthly dates",
    },
    {
      label: "Mood & Energy",
      value: healthScore.factors.moodAverage,
      icon: Heart,
      description: "Average mood score",
    },
    {
      label: "Shared Goals",
      value: healthScore.factors.sharedGoalsProgress,
      icon: Target,
      description: "Goals progress",
    },
    {
      label: "Communication",
      value: healthScore.factors.communicationScore,
      icon: MessageCircle,
      description: "Love notes exchanged",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Heart className="size-4 text-pink-500" /> Relationship Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg className="size-24" viewBox="0 0 100 100">
              <circle
                className="stroke-muted"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="8"
              />
              <circle
                className="stroke-primary transition-all duration-1000"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${healthScore.overall * 2.51} 251`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${getGradeColor(healthScore.grade)}`}>
                {healthScore.grade}
              </span>
              <span className="text-xs text-muted-foreground">{healthScore.overall}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-medium">{healthScore.message}</p>
          </div>
        </div>

        {/* Factor Breakdown */}
        <div className="space-y-3">
          {factors.map((factor) => {
            const Icon = factor.icon;
            return (
              <div key={factor.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <span>{factor.label}</span>
                  </div>
                  <span className={getScoreColor(factor.value)}>
                    {Math.round(factor.value)}%
                  </span>
                </div>
                <Progress value={factor.value} className="h-2" />
              </div>
            );
          })}
        </div>

        {/* Suggestions */}
        {healthScore.suggestions.length > 0 && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium mb-2">Suggestions to improve:</p>
            <ul className="space-y-1">
              {healthScore.suggestions.map((suggestion, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span>•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
