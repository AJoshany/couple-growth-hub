import { z } from "zod";

export const sharedGoalSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  category: z.enum(["CAREER", "HEALTH", "FITNESS", "FINANCE", "LEARNING", "PERSONAL", "OTHER"]),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "PAUSED", "CANCELLED"]).optional(),
  progress: z.coerce.number().min(0).max(100).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
});

export const sharedMilestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
});

export type SharedGoalInput = z.infer<typeof sharedGoalSchema>;
export type SharedMilestoneInput = z.infer<typeof sharedMilestoneSchema>;
