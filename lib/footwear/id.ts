/** Simple unique id generator (no extra dependency). */
export function createId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${rand}`;
}

export function slugifyShoe(brand: string, model: string, pairNumber: number): string {
  const base = `${brand}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const pair = String(pairNumber).padStart(2, "0");
  return `${base}-pair-${pair}`;
}
