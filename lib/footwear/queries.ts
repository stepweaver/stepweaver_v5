import { createId } from "@/lib/footwear/id";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { getDb, isFootwearDbConfigured } from "@/lib/db";
import {
  shoes,
  shoeMileageAllocations,
  shoeObservations,
  shoeMedia,
  type Shoe,
  type ShoeMileageAllocation,
  type ShoeObservation,
  type ShoeMedia,
  type ShoeStatus,
  type NewShoe,
  type NewShoeObservation,
} from "@/lib/db/schema";
import {
  aggregateMileage,
  costPer100Miles,
  costPerMile,
  normalizeMileageType,
  resolveDaysWorn,
  toMilesNumber,
} from "@/lib/footwear/mileage";
import {
  buildCheckpointProgress,
  getLevelForMiles,
  getNextCheckpoint,
  milesRemainingToNext,
  progressToNextPercent,
} from "@/lib/footwear/checkpoints";
import {
  buildRatingTrends,
  buildWearTrends,
  deriveConditionLabel,
  getCurrentCondition,
  milesBeforeFirstDecline,
  type CheckpointObservation,
} from "@/lib/footwear/stats";
import { LEGACY_PUBLIC_DISCLAIMER } from "@/lib/footwear/legacy";
import { fetchCarrierDispatches } from "@/lib/notion/carrier-journal.repo";

export type ShoeDerivedSummary = {
  shoe: Shoe;
  mileage: ReturnType<typeof aggregateMileage>;
  level: ReturnType<typeof getLevelForMiles>;
  nextCheckpoint: ReturnType<typeof getNextCheckpoint>;
  milesRemaining: number | null;
  progressPercent: number;
  checkpointProgress: ReturnType<typeof buildCheckpointProgress>;
  condition: ReturnType<typeof getCurrentCondition>;
  conditionLabel: ReturnType<typeof deriveConditionLabel>;
  /** Amount paid for the pair, if recorded. */
  amountPaid: number | null;
  costPerMile: number | null;
  costPer100Miles: number | null;
  milesBeforeDecline: number | null;
  heroImageUrl: string | null;
  legacyDisclaimer: string | null;
};

function amountPaidNumber(shoe: Shoe): number | null {
  if (shoe.amountPaid == null) return null;
  const n = parseFloat(String(shoe.amountPaid));
  return Number.isFinite(n) ? n : null;
}

function toCheckpointObs(rows: ShoeObservation[]): CheckpointObservation[] {
  return rows
    .filter((o) => o.entryType === "checkpoint" && o.checkpointMiles != null)
    .map((o) => ({
      checkpointMiles: o.checkpointMiles as number,
      date: o.date,
      retrospective: o.retrospective,
      cushioning: o.cushioning,
      stability: o.stability,
      tractionDry: o.tractionDry,
      tractionWet: o.tractionWet,
      comfort: o.comfort,
      fitSecurity: o.fitSecurity,
      breathability: o.breathability,
      durability: o.durability,
      footComfort: o.footComfort,
      kneeComfort: o.kneeComfort,
      hipBackComfort: o.hipBackComfort,
      endOfShiftSupport: o.endOfShiftSupport,
      outsoleWear: o.outsoleWear,
      midsoleWear: o.midsoleWear,
      upperWear: o.upperWear,
      heelWear: o.heelWear,
      insoleWear: o.insoleWear,
      structuralDeformation: o.structuralDeformation,
    }));
}

export function deriveShoeSummary(
  shoe: Shoe,
  allocations: ShoeMileageAllocation[],
  observations: ShoeObservation[],
  media: ShoeMedia[] = [],
  carrierDays: { date: string; miles: number }[] = []
): ShoeDerivedSummary {
  const allocationInputs = allocations.map((a) => ({
    date: a.date,
    miles: toMilesNumber(a.miles),
    mileageType: normalizeMileageType(a.mileageType),
  }));
  const mileage = {
    ...aggregateMileage(allocationInputs),
    daysWorn: resolveDaysWorn({
      allocations: allocationInputs,
      firstWearDate: shoe.firstWearDate,
      retirementDate: shoe.retirementDate,
      carrierDays,
    }),
  };
  const checkpointObs = toCheckpointObs(observations);
  const completedCheckpoints = checkpointObs.map((o) => ({
    checkpointMiles: o.checkpointMiles,
    retrospective: o.retrospective,
  }));
  const condition = getCurrentCondition(checkpointObs);
  const paid = amountPaidNumber(shoe);
  // Prefer an explicit shoe-level hero; never promote checkpoint-linked photos.
  const shoeLevel = media.filter((m) => !m.observationId);
  const hero =
    shoeLevel.find((m) => m.imageType === "hero") ??
    shoeLevel.find((m) => m.imageType === "pair") ??
    shoeLevel[0] ??
    null;

  return {
    shoe,
    mileage,
    level: getLevelForMiles(mileage.totalMiles),
    nextCheckpoint: getNextCheckpoint(mileage.totalMiles),
    milesRemaining: milesRemainingToNext(mileage.totalMiles),
    progressPercent: progressToNextPercent(mileage.totalMiles),
    checkpointProgress: buildCheckpointProgress({
      totalMiles: mileage.totalMiles,
      completedCheckpoints,
      isLegacyRecord: shoe.isLegacyRecord,
    }),
    condition,
    conditionLabel: deriveConditionLabel(condition),
    amountPaid: paid,
    costPerMile: costPerMile(paid, mileage.totalMiles),
    costPer100Miles: costPer100Miles(paid, mileage.totalMiles),
    milesBeforeDecline: milesBeforeFirstDecline(checkpointObs),
    heroImageUrl: hero?.imageUrl ?? null,
    legacyDisclaimer: shoe.isLegacyRecord ? LEGACY_PUBLIC_DISCLAIMER : null,
  };
}

async function loadCarrierDaysForFootwear(): Promise<
  { date: string; miles: number }[]
> {
  try {
    const dispatches = await fetchCarrierDispatches();
    return dispatches.map((d) => ({
      date: d.date,
      miles: d.milesWalked,
    }));
  } catch {
    return [];
  }
}

export async function listShoes(opts?: {
  publicOnly?: boolean;
}): Promise<Shoe[]> {
  if (!isFootwearDbConfigured()) return [];
  const db = getDb();
  if (opts?.publicOnly) {
    return db
      .select()
      .from(shoes)
      .where(eq(shoes.public, true))
      .orderBy(asc(shoes.brand), asc(shoes.model));
  }
  return db.select().from(shoes).orderBy(asc(shoes.brand), asc(shoes.model));
}

export async function getShoeBySlug(
  slug: string,
  opts?: { publicOnly?: boolean }
): Promise<Shoe | null> {
  if (!isFootwearDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(shoes).where(eq(shoes.slug, slug)).limit(1);
  const shoe = rows[0] ?? null;
  if (!shoe) return null;
  if (opts?.publicOnly && !shoe.public) return null;
  return shoe;
}

export async function getShoeById(id: string): Promise<Shoe | null> {
  if (!isFootwearDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(shoes).where(eq(shoes.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getActiveShoe(): Promise<Shoe | null> {
  if (!isFootwearDbConfigured()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(shoes)
    .where(eq(shoes.status, "active"))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAllocationsForShoe(
  shoeId: string
): Promise<ShoeMileageAllocation[]> {
  const db = getDb();
  return db
    .select()
    .from(shoeMileageAllocations)
    .where(eq(shoeMileageAllocations.shoeId, shoeId))
    .orderBy(asc(shoeMileageAllocations.date));
}

export async function getObservationsForShoe(
  shoeId: string,
  opts?: { publicOnly?: boolean }
): Promise<ShoeObservation[]> {
  const db = getDb();
  if (opts?.publicOnly) {
    return db
      .select()
      .from(shoeObservations)
      .where(
        and(eq(shoeObservations.shoeId, shoeId), eq(shoeObservations.public, true))
      )
      .orderBy(desc(shoeObservations.date));
  }
  return db
    .select()
    .from(shoeObservations)
    .where(eq(shoeObservations.shoeId, shoeId))
    .orderBy(desc(shoeObservations.date));
}

export async function getMediaForShoe(
  shoeId: string,
  opts?: { publicOnly?: boolean }
): Promise<ShoeMedia[]> {
  const db = getDb();
  if (opts?.publicOnly) {
    return db
      .select()
      .from(shoeMedia)
      .where(and(eq(shoeMedia.shoeId, shoeId), eq(shoeMedia.public, true)))
      .orderBy(asc(shoeMedia.sortOrder));
  }
  return db
    .select()
    .from(shoeMedia)
    .where(eq(shoeMedia.shoeId, shoeId))
    .orderBy(asc(shoeMedia.sortOrder));
}

export async function getShoeSummaryBySlug(
  slug: string,
  opts?: { publicOnly?: boolean }
): Promise<ShoeDerivedSummary | null> {
  const shoe = await getShoeBySlug(slug, opts);
  if (!shoe) return null;
  const [allocations, observations, media, carrierDays] = await Promise.all([
    getAllocationsForShoe(shoe.id),
    getObservationsForShoe(shoe.id, opts),
    getMediaForShoe(shoe.id, opts),
    loadCarrierDaysForFootwear(),
  ]);
  return deriveShoeSummary(shoe, allocations, observations, media, carrierDays);
}

export async function getActiveShoeSummary(opts?: {
  publicOnly?: boolean;
}): Promise<ShoeDerivedSummary | null> {
  const shoe = await getActiveShoe();
  if (!shoe) return null;
  if (opts?.publicOnly && !shoe.public) return null;
  const [allocations, observations, media, carrierDays] = await Promise.all([
    getAllocationsForShoe(shoe.id),
    getObservationsForShoe(shoe.id, opts),
    getMediaForShoe(shoe.id, opts),
    loadCarrierDaysForFootwear(),
  ]);
  return deriveShoeSummary(shoe, allocations, observations, media, carrierDays);
}

export async function listShoeSummaries(opts?: {
  publicOnly?: boolean;
}): Promise<ShoeDerivedSummary[]> {
  const all = await listShoes(opts);
  const carrierDays = await loadCarrierDaysForFootwear();
  const results: ShoeDerivedSummary[] = [];
  for (const shoe of all) {
    const [allocations, observations, media] = await Promise.all([
      getAllocationsForShoe(shoe.id),
      getObservationsForShoe(shoe.id, opts),
      getMediaForShoe(shoe.id, opts),
    ]);
    results.push(
      deriveShoeSummary(shoe, allocations, observations, media, carrierDays)
    );
  }
  return results;
}

export async function createShoe(
  input: Omit<NewShoe, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<Shoe> {
  const db = getDb();
  const id = input.id ?? createId("shoe");
  if (input.status === "active") {
    await clearActiveStatus();
  }
  const [row] = await db
    .insert(shoes)
    .values({ ...input, id })
    .returning();
  return row;
}

export async function updateShoe(
  id: string,
  patch: Partial<NewShoe>
): Promise<Shoe | null> {
  const db = getDb();
  if (patch.status === "active") {
    await clearActiveStatus(id);
  }
  const [row] = await db
    .update(shoes)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(shoes.id, id))
    .returning();
  return row ?? null;
}

async function clearActiveStatus(exceptId?: string): Promise<void> {
  const db = getDb();
  if (exceptId) {
    await db
      .update(shoes)
      .set({ status: "paused" as ShoeStatus, updatedAt: new Date() })
      .where(
        and(eq(shoes.status, "active"), sql`${shoes.id} != ${exceptId}`)
      );
  } else {
    await db
      .update(shoes)
      .set({ status: "paused" as ShoeStatus, updatedAt: new Date() })
      .where(eq(shoes.status, "active"));
  }
}

export async function setActiveShoe(id: string): Promise<Shoe | null> {
  return updateShoe(id, { status: "active" });
}

export async function replaceWorkAllocationsForDate(input: {
  date: string;
  carrierLogNotionPageId?: string | null;
  allocations: { shoeId: string; miles: number }[];
}): Promise<void> {
  const db = getDb();
  await db
    .delete(shoeMileageAllocations)
    .where(
      and(
        eq(shoeMileageAllocations.date, input.date),
        eq(shoeMileageAllocations.mileageType, "work")
      )
    );

  if (!input.allocations.length) return;

  await db.insert(shoeMileageAllocations).values(
    input.allocations.map((a) => ({
      id: createId("alloc"),
      shoeId: a.shoeId,
      date: input.date,
      miles: String(a.miles),
      mileageType: "work" as const,
      carrierLogNotionPageId: input.carrierLogNotionPageId ?? null,
    }))
  );
}

export async function createAllocation(input: {
  shoeId: string;
  date: string;
  miles: number;
  mileageType: "work" | "estimated" | "adjustment";
  notes?: string;
  carrierLogNotionPageId?: string;
}): Promise<ShoeMileageAllocation> {
  const db = getDb();
  const [row] = await db
    .insert(shoeMileageAllocations)
    .values({
      id: createId("alloc"),
      shoeId: input.shoeId,
      date: input.date,
      miles: String(input.miles),
      mileageType: input.mileageType,
      notes: input.notes ?? null,
      carrierLogNotionPageId: input.carrierLogNotionPageId ?? null,
    })
    .returning();
  return row;
}

export async function createObservation(
  input: Omit<
    typeof shoeObservations.$inferInsert,
    "id" | "createdAt" | "updatedAt"
  > & { id?: string }
): Promise<ShoeObservation> {
  const db = getDb();
  const [row] = await db
    .insert(shoeObservations)
    .values({ ...input, id: input.id ?? createId("obs") })
    .returning();
  return row;
}

export async function getObservationById(
  id: string
): Promise<ShoeObservation | null> {
  if (!isFootwearDbConfigured()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(shoeObservations)
    .where(eq(shoeObservations.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateObservation(
  id: string,
  patch: Partial<NewShoeObservation>
): Promise<ShoeObservation | null> {
  const db = getDb();
  const [row] = await db
    .update(shoeObservations)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(shoeObservations.id, id))
    .returning();
  return row ?? null;
}

export async function createMedia(
  input: Omit<typeof shoeMedia.$inferInsert, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  }
): Promise<ShoeMedia> {
  const db = getDb();
  const [row] = await db
    .insert(shoeMedia)
    .values({ ...input, id: input.id ?? createId("media") })
    .returning();
  return row;
}

export async function getShoeMileageTotal(shoeId: string): Promise<number> {
  const allocations = await getAllocationsForShoe(shoeId);
  return aggregateMileage(
    allocations.map((a) => ({
      date: a.date,
      miles: toMilesNumber(a.miles),
      mileageType: normalizeMileageType(a.mileageType),
    }))
  ).totalMiles;
}

export function getObservationTrends(observations: ShoeObservation[]) {
  const checkpointObs = toCheckpointObs(observations);
  return {
    ratings: buildRatingTrends(checkpointObs),
    wear: buildWearTrends(checkpointObs),
  };
}

export { createId };
