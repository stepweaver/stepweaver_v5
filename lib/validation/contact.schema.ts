import { z } from "zod";
import { stripHeaderUnsafe } from "@/lib/email/strip-header-unsafe";

const headerSafeName = z
  .string()
  .min(1)
  .max(200)
  .transform((value) => stripHeaderUnsafe(value))
  .pipe(z.string().min(1).max(200));

export const contactSchema = z.object({
  name: headerSafeName,
  email: z.string().email().max(200).transform((value) => stripHeaderUnsafe(value)),
  message: z.string().min(1).max(5000),
  _hp_website: z.string().optional(),
  _t: z.number().optional(),
  _d: z.number().optional(),
  cf_turnstile_response: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;
