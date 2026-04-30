/**
 * Meshtastic affiliate URL configuration (Atlavox products), aligned with v3.
 */
const AFFILIATE_SOURCES = [
  { envKey: "NEXT_PUBLIC_ATLAVOX_M1_URL", label: "Atlavox M1 Meshtastic Radio" },
  { envKey: "NEXT_PUBLIC_ATLAVOX_BEACON_URL", label: "Atlavox Beacon Solar Meshtastic Node" },
  { envKey: "NEXT_PUBLIC_ATLAVOX_BEACON_OUTPOST_URL", label: "Atlavox Beacon Solar – Preconfigured (Outpost)" },
  { envKey: "NEXT_PUBLIC_ATLAVOX_M1_CASE_URL", label: "Atlavox M1 DIY Case" },
] as const;

export function getConfiguredAffiliateLinks(): { url: string; label: string }[] {
  return AFFILIATE_SOURCES.filter(
    (s) => typeof process.env[s.envKey] === "string" && (process.env[s.envKey] as string).trim()
  ).map((s) => ({ url: (process.env[s.envKey] as string).trim(), label: s.label }));
}

export function getPrimaryAffiliateUrl(overrideUrl?: string | null): string {
  if (overrideUrl) return overrideUrl;
  return (
    process.env.NEXT_PUBLIC_ATLAVOX_AFFILIATE_URL ||
    process.env.NEXT_PUBLIC_ATLAVOX_M1_URL ||
    ""
  );
}
