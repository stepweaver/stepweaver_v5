import { NextRequest, NextResponse } from "next/server";
import {
  isCarrierJournalLogEnabled,
  previewCarrierDaybookLoad,
  upsertCarrierDaybook,
  verifyCarrierLogSecret,
} from "@/lib/notion/carrier-journal.repo";
import {
  carrierDaybookPreviewSchema,
  carrierDaybookSchema,
} from "@/lib/validation/carrier-log.schema";
import { buildPublicSummary } from "@/lib/carrier-journal/helpers";
import { computeFuelScore, formatFuelScore } from "@/lib/carrier-journal/fuel";
import { formatPublicMailLoadLine } from "@/lib/carrier-journal/mail-load";
import { validateWorkAllocationSplit } from "@/lib/footwear/mileage";
import { isFootwearDbConfigured } from "@/lib/db";
import { replaceWorkAllocationsForDate } from "@/lib/footwear/queries";

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

function notionErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "body" in err) {
    const body = (err as { body?: { message?: string } }).body;
    if (body?.message) return body.message;
  }
  return err instanceof Error ? err.message : "Failed to save carrier daybook entry";
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

  const allocations = parsed.data.footwearAllocations;
  if (allocations && allocations.length > 0) {
    const daybookMiles = parsed.data.miles ?? 0;
    const split = validateWorkAllocationSplit({
      daybookMiles,
      allocations,
    });
    if (!split.ok) {
      return NextResponse.json({ error: split.error }, { status: 400 });
    }
  }

  try {
    const { pageId, dpsPerMile } = await upsertCarrierDaybook(parsed.data);

    let footwearWarning: string | undefined;
    if (allocations && isFootwearDbConfigured()) {
      try {
        await replaceWorkAllocationsForDate({
          date: parsed.data.date,
          carrierLogNotionPageId: pageId,
          allocations,
        });
      } catch (err) {
        footwearWarning =
          err instanceof Error
            ? `Daybook saved, but footwear allocation failed: ${err.message}`
            : "Daybook saved, but footwear allocation failed.";
      }
    }

    const mailLoad = await previewCarrierDaybookLoad({
      date: parsed.data.date,
      dpsCount: parsed.data.dpsCount,
      parcels: parsed.data.parcels,
    });

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
      mailLoadSummary: formatPublicMailLoadLine({
        tier: mailLoad.tier,
        compositeRatio: mailLoad.compositeRatio,
      }),
      mailLoad,
      ...(footwearWarning && { footwearWarning }),
      ...(fuelScore && {
        fuelScore: fuelScore.score,
        fuelScoreLabel: formatFuelScore(fuelScore.score),
        fuelIsWin: fuelScore.isWin,
      }),
    });
  } catch (err) {
    return NextResponse.json({ error: notionErrorMessage(err) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isCarrierJournalLogEnabled()) {
    return unavailable();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = carrierDaybookPreviewSchema.safeParse(body);
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
    const mailLoad = await previewCarrierDaybookLoad({
      date: parsed.data.date,
      dpsCount: parsed.data.dpsCount,
      parcels: parsed.data.parcels,
    });

    return NextResponse.json({
      mailLoadSummary: formatPublicMailLoadLine({
        tier: mailLoad.tier,
        compositeRatio: mailLoad.compositeRatio,
      }),
      mailLoad,
    });
  } catch (err) {
    return NextResponse.json({ error: notionErrorMessage(err) }, { status: 500 });
  }
}
