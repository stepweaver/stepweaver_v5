import { z } from "zod";
import { MAIL_DAY_CONTEXT_OPTIONS } from "@/lib/dps";

const mailDayContextSchema = z.enum(MAIL_DAY_CONTEXT_OPTIONS);

const routeFoodEatenSchema = z.enum(["none", "partial", "all"]);
const mealQualitySchema = z.enum(["poor", "okay", "solid"]);
const proteinAnchorsSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);
const fruitVegServingsSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);
const gatoradeCountSchema = z.union([z.literal(0), z.literal(1), z.literal(2)]);

export const fuelLogSchema = z.object({
  breakfastProtein: z.boolean().optional(),
  routeFoodPacked: z.boolean().optional(),
  routeFoodEaten: routeFoodEatenSchema.optional(),
  proteinAnchors: proteinAnchorsSchema.optional(),
  fruitVegServings: fruitVegServingsSchema.optional(),
  gatorade: gatoradeCountSchema.optional(),
  mountainDewOz: z.number().finite().min(0).optional(),
  postShiftMealQuality: mealQualitySchema.optional(),
});

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

export const carrierDaybookSchema = z.object({
  logSecret: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  miles: z.number().finite().min(0).optional(),
  dpsCount: z.number().finite().min(0).optional(),
  mailDayContext: z.array(mailDayContextSchema).optional(),
  parcels: z.number().finite().min(0).optional(),
  waterOz: z.number().finite().min(0).optional(),
  hydrationGoalOz: z.number().finite().min(0).optional(),
  weightLbs: z.number().finite().min(0).optional(),
  mood: z.number().int().min(1).max(10).optional(),
  energy: z.number().int().min(1).max(10).optional(),
  soreness: z.number().int().min(1).max(10).optional(),
  temperatureF: z.number().finite().optional(),
  heatIndexF: z.number().finite().optional(),
  publicNote: z.string().trim().max(2000).optional(),
  privateNote: z.string().trim().max(2000).optional(),
  published: z.boolean().default(true),
  fuel: fuelLogSchema.optional(),
  /** Work miles assigned to one or more shoes for this day. Sum must be ≤ miles. */
  footwearAllocations: z
    .array(
      z.object({
        shoeId: z.string().min(1),
        miles: z.number().finite().min(0),
      })
    )
    .optional(),
});

export type CarrierDaybookInput = z.infer<typeof carrierDaybookSchema>;

export const carrierDaybookPreviewSchema = z.object({
  logSecret: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dpsCount: z.number().finite().min(0).optional(),
  parcels: z.number().finite().min(0).optional(),
});
