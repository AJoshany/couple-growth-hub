import { z } from "zod";

export const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  category: z.enum(["CAREER", "HEALTH", "FITNESS", "FINANCE", "LEARNING", "PERSONAL", "OTHER"]),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "PAUSED", "CANCELLED"]).optional(),
  progress: z.coerce.number().min(0).max(100).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
});

export const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
});

export const updateProgressSchema = z.object({
  progress: z.coerce.number().min(0).max(100),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "PAUSED", "CANCELLED"]).optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;
export type MilestoneInput = z.infer<typeof milestoneSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
