export interface ReflectionPrompt {
  id: string;
  category: string;
  prompt: string;
  description?: string;
}

export const reflectionPrompts: ReflectionPrompt[] = [
  // Daily Reflections
  {
    id: "daily-gratitude",
    category: "Gratitude",
    prompt: "What are three things you're grateful for today?",
    description: "Practice gratitude to boost happiness",
  },
  {
    id: "daily-wins",
    category: "Gratitude",
    prompt: "What was your biggest win today, no matter how small?",
    description: "Celebrate your achievements",
  },
  {
    id: "daily-kindness",
    category: "Gratitude",
    prompt: "What act of kindness did you witness or perform today?",
    description: "Recognize the good around you",
  },

  // Self-Awareness
  {
    id: "self-emotions",
    category: "Self-Awareness",
    prompt: "What emotions did you experience most today? Why?",
    description: "Understand your emotional patterns",
  },
  {
    id: "self-stress",
    category: "Self-Awareness",
    prompt: "What caused you stress today? How did you handle it?",
    description: "Identify and manage stressors",
  },
  {
    id: "self-energy",
    category: "Self-Awareness",
    prompt: "When did you feel most energized today? What were you doing?",
    description: "Discover what energizes you",
  },

  // Growth
  {
    id: "growth-lesson",
    category: "Growth",
    prompt: "What did you learn today?",
    description: "Reflect on new knowledge or insights",
  },
  {
    id: "growth-challenge",
    category: "Growth",
    prompt: "What challenge did you face? How did you overcome it?",
    description: "Build resilience through reflection",
  },
  {
    id: "growth-improvement",
    category: "Growth",
    prompt: "What could you have done better today?",
    description: "Identify areas for improvement",
  },

  // Relationships
  {
    id: "rel-connection",
    category: "Relationships",
    prompt: "How did you connect with someone you care about today?",
    description: "Nurture your relationships",
  },
  {
    id: "rel-communication",
    category: "Relationships",
    prompt: "Was there a conversation that stood out today? Why?",
    description: "Reflect on meaningful interactions",
  },
  {
    id: "rel-support",
    category: "Relationships",
    prompt: "How did you support someone else today?",
    description: "Recognize your impact on others",
  },

  // Mindfulness
  {
    id: "mind-presence",
    category: "Mindfulness",
    prompt: "Describe a moment today when you were fully present.",
    description: "Practice being in the moment",
  },
  {
    id: "mind-nature",
    category: "Mindfulness",
    prompt: "What did you notice about nature or your surroundings today?",
    description: "Connect with the world around you",
  },
  {
    id: "mind-breath",
    category: "Mindfulness",
    prompt: "When did you take a moment to breathe deeply today?",
    description: "Practice mindful breathing",
  },

  // Future Planning
  {
    id: "future-goals",
    category: "Future",
    prompt: "What's one thing you want to accomplish tomorrow?",
    description: "Set intentions for tomorrow",
  },
  {
    id: "future-dreams",
    category: "Future",
    prompt: "What's a goal you're working toward? How did you progress today?",
    description: "Track your long-term goals",
  },
  {
    id: "future-vision",
    category: "Future",
    prompt: "Where do you see yourself in one year? What steps did you take today?",
    description: "Visualize your future self",
  },

  // Couple-Specific
  {
    id: "couple-appreciation",
    category: "Couple",
    prompt: "What did you appreciate about your partner today?",
    description: "Express gratitude for your partner",
  },
  {
    id: "couple-moment",
    category: "Couple",
    prompt: "What was your favorite moment together today?",
    description: "Cherish shared experiences",
  },
  {
    id: "couple-support",
    category: "Couple",
    prompt: "How did you support each other today?",
    description: "Recognize mutual support",
  },
];

export function getPromptsByCategory(category: string): ReflectionPrompt[] {
  return reflectionPrompts.filter((p) => p.category === category);
}

export function getRandomPrompt(category?: string): ReflectionPrompt {
  const prompts = category
    ? getPromptsByCategory(category)
    : reflectionPrompts;
  return prompts[Math.floor(Math.random() * prompts.length)];
}

export function getCategories(): string[] {
  return [...new Set(reflectionPrompts.map((p) => p.category))];
}
