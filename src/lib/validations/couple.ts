import { z } from "zod";

export const createCoupleSchema = z.object({
  name: z.string().optional(),
  startDate: z.string().optional(),
});

export const acceptInviteSchema = z.object({
  code: z.string().min(1, "Invitation code is required"),
});

export type CreateCoupleInput = z.infer<typeof createCoupleSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
