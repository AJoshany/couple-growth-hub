import { z } from "zod";

export const journalEntrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  summary: z.string().optional(),
  accomplishments: z.string().optional(),
  learned: z.string().optional(),
  difficult: z.string().optional(),
  tomorrow: z.string().optional(),
  mood: z.coerce.number().min(1).max(5).optional(),
  energy: z.coerce.number().min(1).max(5).optional(),
  productivity: z.coerce.number().min(1).max(5).optional(),
  visibility: z.enum(["PRIVATE", "PARTNER_VISIBLE"]).optional(),
});

export const activitySchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  goalId: z.string().optional(),
});

export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
