import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  message: z.string().min(1).max(5000),
  _hp_website: z.string().optional(),
  _t: z.number().optional(),
  _d: z.number().optional(),
});

export type ContactForm = z.infer<typeof contactSchema>;
