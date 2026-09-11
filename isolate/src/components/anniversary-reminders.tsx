"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Anniversary, getAnniversaryMessage, getYearsTogether, getMonthsTogether } from "@/lib/anniversaries";
import { Heart, Calendar, Gift, Star } from "lucide-react";

interface AnniversaryRemindersProps {
  startDate: Date | null;
  firstDate: Date | null;
  firstMemory: Date | null;
}

const typeIcons = {
  relationship: Heart,
  first_date: Calendar,
  first_memory: Star,
  custom: Gift,
};

const typeColors = {
  relationship: "bg-pink-100 text-pink-800",
  first_date: "bg-blue-100 text-blue-800",
  first_memory: "bg-purple-100 text-purple-800",
  custom: "bg-green-100 text-green-800",
};

export function AnniversaryReminders({
  startDate,
  firstDate,
  firstMemory,
}: AnniversaryRemindersProps) {
  // Calculate anniversaries
  const anniversaries: Anniversary[] = [];

  if (startDate) {
    const today = new Date();
    const nextDate = new Date(startDate);
    nextDate.setFullYear(today.getFullYear());
    if (nextDate < today) nextDate.setFullYear(today.getFullYear() + 1);
    const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    anniversaries.push({
      id: "relationship",
      title: "Relationship Anniversary",
      date: nextDate,
      type: "relationship",
      daysUntil,
      isPast: false,
    });
  }

  if (firstDate) {
    const today = new Date();
    const nextDate = new Date(firstDate);
    nextDate.setFullYear(today.getFullYear());
    if (nextDate < today) nextDate.setFullYear(today.getFullYear() + 1);
    const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    anniversaries.push({
      id: "first-date",
      title: "First Date Anniversary",
      date: nextDate,
      type: "first_date",
      daysUntil,
      isPast: false,
    });
  }

  if (firstMemory) {
    const today = new Date();
    const nextDate = new Date(firstMemory);
    nextDate.setFullYear(today.getFullYear());
    if (nextDate < today) nextDate.setFullYear(today.getFullYear() + 1);
    const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    anniversaries.push({
      id: "first-memory",
      title: "First Memory Anniversary",
      date: nextDate,
      type: "first_memory",
      daysUntil,
      isPast: false,
    });
  }

  anniversaries.sort((a, b) => a.daysUntil - b.daysUntil);

  const yearsTogether = getYearsTogether(startDate);
  const monthsTogether = getMonthsTogether(startDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gift className="size-4" /> Anniversary Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Together */}
        {startDate && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/5">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Heart className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {yearsTogether !== null && yearsTogether > 0
                  ? `${yearsTogether} year${yearsTogether > 1 ? "s" : ""}`
                  : `${monthsTogether || 0} month${monthsTogether !== 1 ? "s" : ""}`}
              </p>
              <p className="text-sm text-muted-foreground">Together</p>
            </div>
          </div>
        )}

        {/* Upcoming Anniversaries */}
        {anniversaries.length > 0 ? (
          <div className="space-y-3">
            {anniversaries.map((anniversary) => {
              const Icon = typeIcons[anniversary.type];
              return (
                <div
                  key={anniversary.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div className={`flex size-10 items-center justify-center rounded-full ${typeColors[anniversary.type]}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{anniversary.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(anniversary.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant={anniversary.daysUntil <= 7 ? "default" : "secondary"}>
                    {anniversary.daysUntil === 0
                      ? "Today!"
                      : `${anniversary.daysUntil} days`}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Set your relationship start date to see anniversary reminders
          </p>
        )}
      </CardContent>
    </Card>
  );
}
