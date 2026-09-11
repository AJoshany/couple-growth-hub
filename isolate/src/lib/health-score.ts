export interface HealthScoreFactors {
  journalConsistency: number; // 0-100
  dateFrequency: number; // 0-100
  moodAverage: number; // 0-100
  sharedGoalsProgress: number; // 0-100
  communicationScore: number; // 0-100
}

export interface HealthScoreResult {
  overall: number; // 0-100
  factors: HealthScoreFactors;
  grade: "A" | "B" | "C" | "D" | "F";
  message: string;
  suggestions: string[];
}

export function calculateHealthScore(
  journalEntriesThisWeek: number,
  datesThisMonth: number,
  avgMood: number,
  sharedGoalsProgress: number,
  loveNotesThisWeek: number
): HealthScoreResult {
  // Journal consistency (0-100): based on entries per week (ideal: 5-7)
  const journalConsistency = Math.min(100, (journalEntriesThisWeek / 5) * 100);

  // Date frequency (0-100): based on dates per month (ideal: 4+)
  const dateFrequency = Math.min(100, (datesThisMonth / 4) * 100);

  // Mood average (0-100): convert 1-5 scale to 0-100
  const moodAverage = Math.min(100, ((avgMood - 1) / 4) * 100);

  // Shared goals progress (0-100): already on 0-100 scale
  const sharedGoalsProgressScore = sharedGoalsProgress;

  // Communication score (0-100): based on love notes per week (ideal: 5+)
  const communicationScore = Math.min(100, (loveNotesThisWeek / 5) * 100);

  // Calculate overall score (weighted average)
  const overall = Math.round(
    journalConsistency * 0.2 +
    dateFrequency * 0.25 +
    moodAverage * 0.2 +
    sharedGoalsProgressScore * 0.2 +
    communicationScore * 0.15
  );

  // Determine grade
  let grade: HealthScoreResult["grade"];
  if (overall >= 90) grade = "A";
  else if (overall >= 80) grade = "B";
  else if (overall >= 70) grade = "C";
  else if (overall >= 60) grade = "D";
  else grade = "F";

  // Generate message
  const messages: Record<string, string> = {
    A: "Amazing! Your relationship is thriving. Keep up the wonderful work! 💕",
    B: "Great job! You're building a strong connection together. 🌟",
    C: "Good progress! There's room for growth in a few areas. 💪",
    D: "You're making efforts, but could focus more on quality time. 📈",
    F: "Let's work on strengthening your connection. Every small step counts! 🌱",
  };

  // Generate suggestions
  const suggestions: string[] = [];
  if (journalConsistency < 50) {
    suggestions.push("Try to journal together more often this week");
  }
  if (dateFrequency < 50) {
    suggestions.push("Plan a special date this month");
  }
  if (moodAverage < 50) {
    suggestions.push("Check in with each other about how you're feeling");
  }
  if (sharedGoalsProgressScore < 50) {
    suggestions.push("Work on your shared goals together");
  }
  if (communicationScore < 50) {
    suggestions.push("Send more love notes to each other");
  }

  return {
    overall,
    factors: {
      journalConsistency,
      dateFrequency,
      moodAverage,
      sharedGoalsProgress: sharedGoalsProgressScore,
      communicationScore,
    },
    grade,
    message: messages[grade],
    suggestions,
  };
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case "A":
      return "text-green-600";
    case "B":
      return "text-blue-600";
    case "C":
      return "text-yellow-600";
    case "D":
      return "text-orange-600";
    case "F":
      return "text-red-600";
    default:
      return "text-muted-foreground";
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}
