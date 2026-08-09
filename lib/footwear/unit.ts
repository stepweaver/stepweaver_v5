import type { Shoe } from "@/lib/db/schema";

/** Commission / acquisition date used for UNIT sequencing. */
export function shoeCommissionKey(shoe: Pick<
  Shoe,
  "firstWearDate" | "purchaseDate" | "createdAt" | "id"
>): string {
  if (shoe.firstWearDate) return shoe.firstWearDate;
  if (shoe.purchaseDate) return shoe.purchaseDate;
  if (shoe.createdAt instanceof Date) return shoe.createdAt.toISOString();
  if (typeof shoe.createdAt === "string") return shoe.createdAt;
  return shoe.id;
}

/** Assign UNIT 001…N by commission chronology (stable tie-break on id). */
export function assignUnitNumbers<T extends { shoe: Shoe }>(
  summaries: T[]
): Array<T & { unitNumber: number }> {
  const ordered = [...summaries].sort((a, b) => {
    const ka = shoeCommissionKey(a.shoe);
    const kb = shoeCommissionKey(b.shoe);
    const cmp = ka.localeCompare(kb);
    if (cmp !== 0) return cmp;
    return a.shoe.id.localeCompare(b.shoe.id);
  });
  const map = new Map(ordered.map((s, i) => [s.shoe.id, i + 1]));
  return summaries.map((s) => ({
    ...s,
    unitNumber: map.get(s.shoe.id) ?? 1,
  }));
}

export function formatUnitId(unitNumber: number): string {
  return `UNIT ${String(unitNumber).padStart(3, "0")}`;
}
