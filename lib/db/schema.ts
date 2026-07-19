import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const shoeStatuses = [
  "planned",
  "active",
  "paused",
  "retired",
  "failed",
] as const;
export type ShoeStatus = (typeof shoeStatuses)[number];

export const acquisitionTypes = [
  "purchased",
  "gifted",
  "provided_for_testing",
  "discounted",
] as const;
export type AcquisitionType = (typeof acquisitionTypes)[number];

export const mileageConfidenceLevels = [
  "exact",
  "high",
  "estimated",
  "unknown",
] as const;
export type MileageConfidence = (typeof mileageConfidenceLevels)[number];

export const mileageTypes = [
  "work",
  "estimated",
  "adjustment",
] as const;
export type MileageType = (typeof mileageTypes)[number];

export const observationEntryTypes = [
  "baseline",
  "field_note",
  "checkpoint",
  "incident",
  "retirement",
] as const;
export type ObservationEntryType = (typeof observationEntryTypes)[number];

export const imageTypes = [
  "hero",
  "pair",
  "left_outsole",
  "right_outsole",
  "lateral",
  "medial",
  "heel",
  "upper",
  "insole",
  "damage",
  "other",
] as const;
export type ImageType = (typeof imageTypes)[number];

export const retirementReasons = [
  "cushioning_degradation",
  "traction_loss",
  "uneven_wear",
  "upper_failure",
  "heel_collar_failure",
  "fit_problem",
  "pain_or_injury_concern",
  "weather_limitation",
  "reached_planned_testing_endpoint",
  "replaced_but_still_usable",
  "other",
] as const;
export type RetirementReason = (typeof retirementReasons)[number];

export const finalVerdicts = [
  "elite",
  "reliable",
  "serviceable",
  "specialist",
  "disappointing",
  "failed",
] as const;
export type FinalVerdict = (typeof finalVerdicts)[number];

export const postWorkStatuses = [
  "casual_use_only",
  "backup_pair",
  "wet_weather_pair",
  "donated",
  "discarded",
  "fully_retired",
] as const;
export type PostWorkStatus = (typeof postWorkStatuses)[number];

export const shoes = pgTable(
  "shoes",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    brand: text("brand").notNull(),
    model: text("model").notNull(),
    nickname: text("nickname"),
    colorway: text("colorway"),
    size: text("size").notNull(),
    width: text("width"),
    purchaseDate: text("purchase_date"),
    firstWearDate: text("first_wear_date"),
    retirementDate: text("retirement_date"),
    status: text("status").notNull().$type<ShoeStatus>().default("planned"),
    acquisitionType: text("acquisition_type")
      .notNull()
      .$type<AcquisitionType>()
      .default("purchased"),
    retailPrice: numeric("retail_price", { precision: 10, scale: 2 }),
    amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }),
    provider: text("provider"),
    intendedUse: text("intended_use"),
    baselineNotes: text("baseline_notes"),
    isLegacyRecord: boolean("is_legacy_record").notNull().default(false),
    mileageConfidence: text("mileage_confidence")
      .notNull()
      .$type<MileageConfidence>()
      .default("exact"),
    public: boolean("public").notNull().default(false),
    retirementReason: text("retirement_reason").$type<RetirementReason>(),
    retiredFromWorkOnly: boolean("retired_from_work_only"),
    failureLocation: text("failure_location"),
    wouldBuyAgain: boolean("would_buy_again"),
    idealUser: text("ideal_user"),
    whoShouldAvoid: text("who_should_avoid"),
    finalVerdict: text("final_verdict").$type<FinalVerdict>(),
    finalReview: text("final_review"),
    postWorkStatus: text("post_work_status").$type<PostWorkStatus>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("shoes_one_active_idx")
      .on(table.status)
      .where(sql`${table.status} = 'active'`),
    index("shoes_public_status_idx").on(table.public, table.status),
  ]
);

export const shoeMileageAllocations = pgTable(
  "shoe_mileage_allocations",
  {
    id: text("id").primaryKey(),
    shoeId: text("shoe_id")
      .notNull()
      .references(() => shoes.id),
    carrierLogNotionPageId: text("carrier_log_notion_page_id"),
    date: text("date").notNull(),
    miles: numeric("miles", { precision: 8, scale: 2 }).notNull(),
    mileageType: text("mileage_type").notNull().$type<MileageType>(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("allocations_shoe_date_idx").on(table.shoeId, table.date),
    index("allocations_date_type_idx").on(table.date, table.mileageType),
  ]
);

export const shoeObservations = pgTable(
  "shoe_observations",
  {
    id: text("id").primaryKey(),
    shoeId: text("shoe_id")
      .notNull()
      .references(() => shoes.id),
    date: text("date").notNull(),
    shoeMileageAtEntry: numeric("shoe_mileage_at_entry", {
      precision: 8,
      scale: 2,
    }).notNull(),
    entryType: text("entry_type").notNull().$type<ObservationEntryType>(),
    checkpointMiles: integer("checkpoint_miles"),
    title: text("title"),
    notes: text("notes").notNull(),
    cushioning: integer("cushioning"),
    stability: integer("stability"),
    tractionDry: integer("traction_dry"),
    tractionWet: integer("traction_wet"),
    comfort: integer("comfort"),
    fitSecurity: integer("fit_security"),
    breathability: integer("breathability"),
    durability: integer("durability"),
    footComfort: integer("foot_comfort"),
    kneeComfort: integer("knee_comfort"),
    hipBackComfort: integer("hip_back_comfort"),
    endOfShiftSupport: integer("end_of_shift_support"),
    outsoleWear: integer("outsole_wear"),
    midsoleWear: integer("midsole_wear"),
    upperWear: integer("upper_wear"),
    heelWear: integer("heel_wear"),
    insoleWear: integer("insole_wear"),
    structuralDeformation: integer("structural_deformation"),
    wouldContinueWearing: boolean("would_continue_wearing"),
    betterThanPrevious: text("better_than_previous"),
    worseThanPrevious: text("worse_than_previous"),
    newDiscomfortPatterns: text("new_discomfort_patterns"),
    tractionChanged: text("traction_changed"),
    fitChanged: text("fit_changed"),
    unexpectedEvents: text("unexpected_events"),
    monitorNext: text("monitor_next"),
    incidentType: text("incident_type"),
    conditions: text("conditions"),
    bodyImpact: text("body_impact"),
    remainedInService: boolean("remained_in_service"),
    immediatelyRetired: boolean("immediately_retired"),
    retrospective: boolean("retrospective").notNull().default(false),
    public: boolean("public").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("observations_shoe_date_idx").on(table.shoeId, table.date),
    uniqueIndex("observations_checkpoint_unique_idx")
      .on(table.shoeId, table.checkpointMiles)
      .where(sql`${table.entryType} = 'checkpoint'`),
  ]
);

export const shoeMedia = pgTable(
  "shoe_media",
  {
    id: text("id").primaryKey(),
    shoeId: text("shoe_id")
      .notNull()
      .references(() => shoes.id),
    observationId: text("observation_id").references(() => shoeObservations.id),
    imageUrl: text("image_url").notNull(),
    imageType: text("image_type").notNull().$type<ImageType>(),
    mileageAtPhoto: numeric("mileage_at_photo", {
      precision: 8,
      scale: 2,
    }).notNull(),
    caption: text("caption"),
    altText: text("alt_text"),
    sortOrder: integer("sort_order").notNull().default(0),
    public: boolean("public").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("media_shoe_idx").on(table.shoeId),
    index("media_observation_idx").on(table.observationId),
  ]
);

export type Shoe = typeof shoes.$inferSelect;
export type NewShoe = typeof shoes.$inferInsert;
export type ShoeMileageAllocation = typeof shoeMileageAllocations.$inferSelect;
export type NewShoeMileageAllocation = typeof shoeMileageAllocations.$inferInsert;
export type ShoeObservation = typeof shoeObservations.$inferSelect;
export type NewShoeObservation = typeof shoeObservations.$inferInsert;
export type ShoeMedia = typeof shoeMedia.$inferSelect;
export type NewShoeMedia = typeof shoeMedia.$inferInsert;
