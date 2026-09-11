export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  milestones: string[];
}

export const goalTemplates: GoalTemplate[] = [
  // Career
  {
    id: "career-promotion",
    title: "Get a Promotion",
    description: "Work towards your next career milestone",
    category: "CAREER",
    icon: "💼",
    milestones: [
      "Identify skills needed for promotion",
      "Complete relevant training/certification",
      "Take on a leadership project",
      "Get feedback from manager",
      "Submit promotion application",
    ],
  },
  {
    id: "career-switch",
    title: "Career Change",
    description: "Transition to a new career path",
    category: "CAREER",
    icon: "🔄",
    milestones: [
      "Research target industry",
      "Identify transferable skills",
      "Build new skills/portfolio",
      "Network with professionals",
      "Apply for positions",
    ],
  },
  // Health
  {
    id: "health-weight",
    title: "Reach Target Weight",
    description: "Achieve your healthy weight goal",
    category: "HEALTH",
    icon: "⚖️",
    milestones: [
      "Set realistic weight goal",
      "Create meal plan",
      "Establish exercise routine",
      "Track progress weekly",
      "Reach target weight",
    ],
  },
  {
    id: "health-sleep",
    title: "Improve Sleep Quality",
    description: "Get better rest each night",
    category: "HEALTH",
    icon: "😴",
    milestones: [
      "Set consistent bedtime",
      "Create bedtime routine",
      "Limit screen time before bed",
      "Sleep 7+ hours for 2 weeks",
      "Maintain for 30 days",
    ],
  },
  // Fitness
  {
    id: "fitness-marathon",
    title: "Run a Marathon",
    description: "Train for and complete a marathon",
    category: "FITNESS",
    icon: "🏃",
    milestones: [
      "Run 5K without stopping",
      "Complete 10K",
      "Run half marathon",
      "Follow 16-week training plan",
      "Complete marathon",
    ],
  },
  {
    id: "fitness-strength",
    title: "Get Stronger",
    description: "Build strength and muscle",
    category: "FITNESS",
    icon: "💪",
    milestones: [
      "Establish workout routine",
      "Learn proper form",
      "Increase weights progressively",
      "Work out 3x/week for 4 weeks",
      "Hit strength milestones",
    ],
  },
  // Finance
  {
    id: "finance-emergency",
    title: "Build Emergency Fund",
    description: "Save 3-6 months of expenses",
    category: "FINANCE",
    icon: "🏦",
    milestones: [
      "Calculate monthly expenses",
      "Set savings target",
      "Set up automatic transfers",
      "Save 1 month expenses",
      "Save 3 months expenses",
    ],
  },
  {
    id: "finance-debt",
    title: "Pay Off Debt",
    description: "Become debt-free",
    category: "FINANCE",
    icon: "💳",
    milestones: [
      "List all debts",
      "Create payoff strategy",
      "Make extra payments",
      "Pay off smallest debt",
      "Become debt-free",
    ],
  },
  // Learning
  {
    id: "learning-language",
    title: "Learn a Language",
    description: "Become conversational in a new language",
    category: "LEARNING",
    icon: "🗣️",
    milestones: [
      "Learn basic phrases",
      "Complete beginner course",
      "Practice 15 min daily for 30 days",
      "Have a 5-minute conversation",
      "Reach intermediate level",
    ],
  },
  {
    id: "learning-instrument",
    title: "Learn an Instrument",
    description: "Learn to play a musical instrument",
    category: "LEARNING",
    icon: "🎸",
    milestones: [
      "Learn basic chords/notes",
      "Practice 20 min daily",
      "Learn first song",
      "Play for someone",
      "Perform a full song",
    ],
  },
  // Personal
  {
    id: "personal-meditation",
    title: "Meditation Habit",
    description: "Build a daily meditation practice",
    category: "PERSONAL",
    icon: "🧘",
    milestones: [
      "Meditate 5 min daily for 1 week",
      "Complete 10 min sessions",
      "Meditate daily for 30 days",
      "Try different techniques",
      "Maintain for 90 days",
    ],
  },
  {
    id: "personal-reading",
    title: "Read 24 Books",
    description: "Read 2 books per month",
    category: "PERSONAL",
    icon: "📚",
    milestones: [
      "Create reading list",
      "Read 6 books (Q1)",
      "Read 12 books (Q2)",
      "Read 18 books (Q3)",
      "Read 24 books (Q4)",
    ],
  },
];

export function getTemplatesByCategory(category: string): GoalTemplate[] {
  return goalTemplates.filter((t) => t.category === category);
}

export function getTemplateById(id: string): GoalTemplate | undefined {
  return goalTemplates.find((t) => t.id === id);
}
