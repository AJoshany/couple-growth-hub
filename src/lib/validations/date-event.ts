import { z } from "zod";

export const dateEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  location: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  type: z.string().optional(),
  notes: z.string().optional(),
});

export const missingEntrySchema = z.object({
  value: z.coerce.number().min(0).max(100),
  date: z.string().optional(),
});

export type DateEventInput = z.infer<typeof dateEventSchema>;
export type MissingEntryInput = z.infer<typeof missingEntrySchema>;
