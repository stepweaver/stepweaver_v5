import { z } from "zod";
import {
  acquisitionTypes,
  finalVerdicts,
  imageTypes,
  mileageConfidenceLevels,
  mileageTypes,
  observationEntryTypes,
  postWorkStatuses,
  retirementReasons,
  shoeStatuses,
} from "@/lib/db/schema";
import { normalizeFootwearDate } from "@/lib/footwear/dates";

const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Use YYYY-MM-DD or MM/DD/YYYY",
});

/** Optional date: YYYY-MM-DD or MM/DD/YYYY → YYYY-MM-DD */
const optionalDateSchema = z.preprocess((val) => {
  if (val == null || val === "") return undefined;
  return normalizeFootwearDate(val) ?? val;
}, isoDateString.optional());

/** Required date: YYYY-MM-DD or MM/DD/YYYY → YYYY-MM-DD */
const requiredDateSchema = z.preprocess((val) => {
  if (val == null || val === "") return val;
  return normalizeFootwearDate(val) ?? val;
}, isoDateString);

/** Nullable date for updates */
const nullableDateSchema = z.preprocess((val) => {
  if (val === null) return null;
  if (val == null || val === "") return undefined;
  return normalizeFootwearDate(val) ?? val;
}, isoDateString.nullable().optional());

const rating1to10 = z.number().int().min(1).max(10).optional();
const wear0to5 = z.number().int().min(0).max(5).optional();

export const footwearAuthSchema = z.object({
  logSecret: z.string().min(1),
});

export const createShoeSchema = footwearAuthSchema.extend({
  brand: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(120),
  nickname: z.string().trim().max(80).optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120)
    .optional(),
  colorway: z.string().trim().max(80).optional(),
  size: z.string().trim().min(1).max(20),
  width: z.string().trim().max(20).optional(),
  purchaseDate: optionalDateSchema,
  firstWearDate: optionalDateSchema,
  status: z.enum(shoeStatuses).default("planned"),
  acquisitionType: z.enum(acquisitionTypes).default("purchased"),
  retailPrice: z.number().finite().min(0).optional(),
  amountPaid: z.number().finite().min(0).optional(),
  provider: z.string().trim().max(120).optional(),
  intendedUse: z.string().trim().max(200).optional(),
  baselineNotes: z.string().trim().max(4000).optional(),
  isLegacyRecord: z.boolean().default(false),
  mileageConfidence: z.enum(mileageConfidenceLevels).default("exact"),
  public: z.boolean().default(false),
  estimatedWorkMiles: z.number().finite().min(0).optional(),
});

export type CreateShoeInput = z.infer<typeof createShoeSchema>;

export const updateShoeSchema = footwearAuthSchema.extend({
  id: z.string().min(1),
  brand: z.string().trim().min(1).max(80).optional(),
  model: z.string().trim().min(1).max(120).optional(),
  nickname: z.string().trim().max(80).optional().nullable(),
  colorway: z.string().trim().max(80).optional().nullable(),
  size: z.string().trim().min(1).max(20).optional(),
  width: z.string().trim().max(20).optional().nullable(),
  purchaseDate: nullableDateSchema,
  firstWearDate: nullableDateSchema,
  status: z.enum(shoeStatuses).optional(),
  acquisitionType: z.enum(acquisitionTypes).optional(),
  retailPrice: z.number().finite().min(0).optional().nullable(),
  amountPaid: z.number().finite().min(0).optional().nullable(),
  provider: z.string().trim().max(120).optional().nullable(),
  intendedUse: z.string().trim().max(200).optional().nullable(),
  baselineNotes: z.string().trim().max(4000).optional().nullable(),
  isLegacyRecord: z.boolean().optional(),
  mileageConfidence: z.enum(mileageConfidenceLevels).optional(),
  public: z.boolean().optional(),
});

export const setActiveShoeSchema = footwearAuthSchema.extend({
  id: z.string().min(1),
});

export const createAllocationSchema = footwearAuthSchema.extend({
  shoeId: z.string().min(1),
  date: requiredDateSchema,
  miles: z.number().finite().min(0),
  mileageType: z.enum(mileageTypes),
  notes: z.string().trim().max(2000).optional(),
});

export const footwearAllocationItemSchema = z.object({
  shoeId: z.string().min(1),
  miles: z.number().finite().min(0),
});

export const createObservationSchema = footwearAuthSchema.extend({
  shoeId: z.string().min(1),
  date: requiredDateSchema,
  entryType: z.enum(observationEntryTypes),
  checkpointMiles: z.number().int().min(0).optional(),
  title: z.string().trim().max(160).optional(),
  notes: z.string().trim().min(1).max(8000),
  cushioning: rating1to10,
  stability: rating1to10,
  tractionDry: rating1to10,
  tractionWet: rating1to10,
  comfort: rating1to10,
  fitSecurity: rating1to10,
  breathability: rating1to10,
  durability: rating1to10,
  footComfort: rating1to10,
  kneeComfort: rating1to10,
  hipBackComfort: rating1to10,
  endOfShiftSupport: rating1to10,
  outsoleWear: wear0to5,
  midsoleWear: wear0to5,
  upperWear: wear0to5,
  heelWear: wear0to5,
  insoleWear: wear0to5,
  structuralDeformation: wear0to5,
  wouldContinueWearing: z.boolean().optional(),
  betterThanPrevious: z.string().trim().max(2000).optional(),
  worseThanPrevious: z.string().trim().max(2000).optional(),
  newDiscomfortPatterns: z.string().trim().max(2000).optional(),
  tractionChanged: z.string().trim().max(2000).optional(),
  fitChanged: z.string().trim().max(2000).optional(),
  unexpectedEvents: z.string().trim().max(2000).optional(),
  monitorNext: z.string().trim().max(2000).optional(),
  incidentType: z.string().trim().max(80).optional(),
  conditions: z.string().trim().max(500).optional(),
  bodyImpact: z.string().trim().max(2000).optional(),
  remainedInService: z.boolean().optional(),
  immediatelyRetired: z.boolean().optional(),
  retrospective: z.boolean().default(false),
  public: z.boolean().default(false),
});

export const updateObservationSchema = footwearAuthSchema.extend({
  id: z.string().min(1),
  date: optionalDateSchema,
  checkpointMiles: z.number().int().min(0).optional().nullable(),
  title: z.string().trim().max(160).optional().nullable(),
  notes: z.string().trim().min(1).max(8000).optional(),
  cushioning: rating1to10.nullable(),
  stability: rating1to10.nullable(),
  tractionDry: rating1to10.nullable(),
  tractionWet: rating1to10.nullable(),
  comfort: rating1to10.nullable(),
  fitSecurity: rating1to10.nullable(),
  breathability: rating1to10.nullable(),
  durability: rating1to10.nullable(),
  footComfort: rating1to10.nullable(),
  kneeComfort: rating1to10.nullable(),
  hipBackComfort: rating1to10.nullable(),
  endOfShiftSupport: rating1to10.nullable(),
  outsoleWear: wear0to5.nullable(),
  midsoleWear: wear0to5.nullable(),
  upperWear: wear0to5.nullable(),
  heelWear: wear0to5.nullable(),
  insoleWear: wear0to5.nullable(),
  structuralDeformation: wear0to5.nullable(),
  wouldContinueWearing: z.boolean().optional().nullable(),
  betterThanPrevious: z.string().trim().max(2000).optional().nullable(),
  worseThanPrevious: z.string().trim().max(2000).optional().nullable(),
  newDiscomfortPatterns: z.string().trim().max(2000).optional().nullable(),
  tractionChanged: z.string().trim().max(2000).optional().nullable(),
  fitChanged: z.string().trim().max(2000).optional().nullable(),
  unexpectedEvents: z.string().trim().max(2000).optional().nullable(),
  monitorNext: z.string().trim().max(2000).optional().nullable(),
  incidentType: z.string().trim().max(80).optional().nullable(),
  conditions: z.string().trim().max(500).optional().nullable(),
  bodyImpact: z.string().trim().max(2000).optional().nullable(),
  remainedInService: z.boolean().optional().nullable(),
  immediatelyRetired: z.boolean().optional().nullable(),
  retrospective: z.boolean().optional(),
  public: z.boolean().optional(),
});

export const retireShoeSchema = footwearAuthSchema.extend({
  id: z.string().min(1),
  retirementDate: requiredDateSchema,
  retirementReason: z.enum(retirementReasons),
  retiredFromWorkOnly: z.boolean().default(false),
  failureLocation: z.string().trim().max(200).optional(),
  wouldBuyAgain: z.boolean(),
  idealUser: z.string().trim().max(500).optional(),
  whoShouldAvoid: z.string().trim().max(500).optional(),
  finalVerdict: z.enum(finalVerdicts),
  finalReview: z.string().trim().min(1).max(8000),
  postWorkStatus: z.enum(postWorkStatuses),
  public: z.boolean().optional(),
  cushioning: rating1to10,
  stability: rating1to10,
  comfort: rating1to10,
  durability: rating1to10,
  outsoleWear: wear0to5,
  midsoleWear: wear0to5,
});

export const mediaMetaSchema = footwearAuthSchema.extend({
  shoeId: z.string().min(1),
  observationId: z.string().min(1).optional(),
  imageType: z.enum(imageTypes),
  caption: z.string().trim().max(300).optional(),
  altText: z.string().trim().max(300).optional(),
  sortOrder: z.number().int().min(0).default(0),
  public: z.boolean().default(false),
});
