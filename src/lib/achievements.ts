export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "goals" | "journal" | "habits" | "relationship" | "special";
  requirement: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserStats {
  goalsCompleted: number;
  milestonesCompleted: number;
  journalEntries: number;
  journalStreak: number;
  habitsTracked: number;
  habitStreak: number;
  datesCompleted: number;
  memoriesAdded: number;
  loveNotesSent: number;
  daysTogether: number;
}

export const achievements: Achievement[] = [
  // Goals
  {
    id: "first-goal",
    name: "First Steps",
    description: "Complete your first goal",
    icon: "🎯",
    category: "goals",
    requirement: "Complete 1 goal",
    unlocked: false,
  },
  {
    id: "goal-master",
    name: "Goal Master",
    description: "Complete 10 goals",
    icon: "🏆",
    category: "goals",
    requirement: "Complete 10 goals",
    unlocked: false,
  },
  {
    id: "milestone-collector",
    name: "Milestone Collector",
    description: "Complete 25 milestones",
    icon: "⭐",
    category: "goals",
    requirement: "Complete 25 milestones",
    unlocked: false,
  },
  {
    id: "goal-setter",
    name: "Goal Setter",
    description: "Create 5 goals",
    icon: "📝",
    category: "goals",
    requirement: "Create 5 goals",
    unlocked: false,
  },

  // Journal
  {
    id: "first-entry",
    name: "Dear Diary",
    description: "Write your first journal entry",
    icon: "📖",
    category: "journal",
    requirement: "Write 1 journal entry",
    unlocked: false,
  },
  {
    id: "consistent-writer",
    name: "Consistent Writer",
    description: "Write 7 journal entries in a row",
    icon: "✍️",
    category: "journal",
    requirement: "7-day journal streak",
    unlocked: false,
  },
  {
    id: "journal-veteran",
    name: "Journal Veteran",
    description: "Write 30 journal entries",
    icon: "📚",
    category: "journal",
    requirement: "Write 30 journal entries",
    unlocked: false,
  },
  {
    id: "reflection-master",
    name: "Reflection Master",
    description: "Write 100 journal entries",
    icon: "🧠",
    category: "journal",
    requirement: "Write 100 journal entries",
    unlocked: false,
  },

  // Habits
  {
    id: "habit-starter",
    name: "Habit Starter",
    description: "Track your first habit",
    icon: "✅",
    category: "habits",
    requirement: "Track 1 habit",
    unlocked: false,
  },
  {
    id: "streak-warrior",
    name: "Streak Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    category: "habits",
    requirement: "7-day habit streak",
    unlocked: false,
  },
  {
    id: "habit-master",
    name: "Habit Master",
    description: "Maintain a 30-day streak",
    icon: "💪",
    category: "habits",
    requirement: "30-day habit streak",
    unlocked: false,
  },
  {
    id: "habit-legend",
    name: "Habit Legend",
    description: "Maintain a 100-day streak",
    icon: "👑",
    category: "habits",
    requirement: "100-day habit streak",
    unlocked: false,
  },

  // Relationship
  {
    id: "first-date",
    name: "First Date",
    description: "Complete your first date",
    icon: "💕",
    category: "relationship",
    requirement: "Complete 1 date",
    unlocked: false,
  },
  {
    id: "date-night",
    name: "Date Night",
    description: "Complete 10 dates",
    icon: "🌹",
    category: "relationship",
    requirement: "Complete 10 dates",
    unlocked: false,
  },
  {
    id: "memory-maker",
    name: "Memory Maker",
    description: "Add 10 memories",
    icon: "📸",
    category: "relationship",
    requirement: "Add 10 memories",
    unlocked: false,
  },
  {
    id: "love-letter",
    name: "Love Letter",
    description: "Send 50 love notes",
    icon: "💌",
    category: "relationship",
    requirement: "Send 50 love notes",
    unlocked: false,
  },

  // Special
  {
    id: "anniversary",
    name: "Anniversary",
    description: "Reach 1 year together",
    icon: "🎉",
    category: "special",
    requirement: "1 year together",
    unlocked: false,
  },
  {
    id: "perfect-week",
    name: "Perfect Week",
    description: "Complete all habits for 7 days",
    icon: "🌟",
    category: "special",
    requirement: "Perfect week",
    unlocked: false,
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Write a journal entry before 8 AM",
    icon: "🌅",
    category: "special",
    requirement: "Journal before 8 AM",
    unlocked: false,
  },
];

export function calculateAchievements(stats: UserStats): Achievement[] {
  return achievements.map((achievement) => {
    let unlocked = false;

    switch (achievement.id) {
      case "first-goal":
        unlocked = stats.goalsCompleted >= 1;
        break;
      case "goal-master":
        unlocked = stats.goalsCompleted >= 10;
        break;
      case "milestone-collector":
        unlocked = stats.milestonesCompleted >= 25;
        break;
      case "goal-setter":
        unlocked = stats.goalsCompleted >= 5;
        break;
      case "first-entry":
        unlocked = stats.journalEntries >= 1;
        break;
      case "consistent-writer":
        unlocked = stats.journalStreak >= 7;
        break;
      case "journal-veteran":
        unlocked = stats.journalEntries >= 30;
        break;
      case "reflection-master":
        unlocked = stats.journalEntries >= 100;
        break;
      case "habit-starter":
        unlocked = stats.habitsTracked >= 1;
        break;
      case "streak-warrior":
        unlocked = stats.habitStreak >= 7;
        break;
      case "habit-master":
        unlocked = stats.habitStreak >= 30;
        break;
      case "habit-legend":
        unlocked = stats.habitStreak >= 100;
        break;
      case "first-date":
        unlocked = stats.datesCompleted >= 1;
        break;
      case "date-night":
        unlocked = stats.datesCompleted >= 10;
        break;
      case "memory-maker":
        unlocked = stats.memoriesAdded >= 10;
        break;
      case "love-letter":
        unlocked = stats.loveNotesSent >= 50;
        break;
      case "anniversary":
        unlocked = stats.daysTogether >= 365;
        break;
      default:
        unlocked = false;
    }

    return { ...achievement, unlocked };
  });
}

export function getUnlockedCount(achievements: Achievement[]): number {
  return achievements.filter((a) => a.unlocked).length;
}

export function getProgress(achievements: Achievement[]): number {
  return Math.round((getUnlockedCount(achievements) / achievements.length) * 100);
}
