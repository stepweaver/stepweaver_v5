import { NextRequest, NextResponse } from "next/server";
import {
  isCarrierJournalLogEnabled,
  upsertCarrierDaybook,
  verifyCarrierLogSecret,
} from "@/lib/notion/carrier-journal.repo";
import { carrierDaybookSchema } from "@/lib/validation/carrier-log.schema";
import { buildPublicSummary } from "@/lib/carrier-journal/helpers";
import { computeFuelScore, formatFuelScore } from "@/lib/carrier-journal/fuel";

function unauthorized() {
  return NextResponse.json(
    {
      error: "403 // YOU SHALL NOT PASS",
      message:
        "Nice try, route goblin. No token. No entry. No DPS glory.",
    },
    { status: 401 }
  );
}

function unavailable() {
  return NextResponse.json(
    { error: "Carrier daybook API is not configured" },
    { status: 503 }
  );
}

export async function POST(request: NextRequest) {
  if (!isCarrierJournalLogEnabled()) {
    return unavailable();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = carrierDaybookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!verifyCarrierLogSecret(parsed.data.logSecret)) {
    return unauthorized();
  }

  try {
    const { pageId, dpsPerMile } = await upsertCarrierDaybook(parsed.data);

    const publicSummary = buildPublicSummary({
      miles: parsed.data.miles,
      dpsCount: parsed.data.dpsCount,
      dpsPerMile,
      temperatureF: parsed.data.temperatureF,
      heatIndexF: parsed.data.heatIndexF,
      publicNote: parsed.data.publicNote,
    });

    const fuelScore = parsed.data.fuel ? computeFuelScore(parsed.data.fuel) : null;

    return NextResponse.json({
      ok: true,
      pageId,
      dpsPerMile,
      publicSummary,
      ...(fuelScore && {
        fuelScore: fuelScore.score,
        fuelScoreLabel: formatFuelScore(fuelScore.score),
        fuelIsWin: fuelScore.isWin,
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save carrier daybook entry";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
