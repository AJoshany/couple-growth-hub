import { z } from "zod";

export const memorySchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  location: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  dateEventId: z.string().optional(),
});

export type MemoryInput = z.infer<typeof memorySchema>;
