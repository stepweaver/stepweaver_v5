import { z } from "zod";
import { MAIL_DAY_CONTEXT_OPTIONS } from "@/lib/dps";

const mailDayContextSchema = z.enum(MAIL_DAY_CONTEXT_OPTIONS);

export const carrierLogDpsSchema = z.object({
  logSecret: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dpsCount: z.number().finite().positive().optional(),
  mailDayContext: z.array(mailDayContextSchema).optional(),
});

export const carrierLogDpsPreviewSchema = z.object({
  logSecret: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dpsCount: z.number().finite().positive().optional(),
});

export type CarrierLogDpsInput = z.infer<typeof carrierLogDpsSchema>;
