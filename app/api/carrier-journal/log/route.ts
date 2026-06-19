import { NextRequest, NextResponse } from "next/server";
import {
  isCarrierJournalLogEnabled,
  previewCarrierLogDps,
  upsertCarrierLogDps,
  verifyCarrierLogSecret,
} from "@/lib/notion/carrier-journal.repo";
import {
  carrierLogDpsPreviewSchema,
  carrierLogDpsSchema,
} from "@/lib/validation/carrier-log.schema";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function unavailable() {
  return NextResponse.json({ error: "Carrier log API is not configured" }, { status: 503 });
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

  const parsed = carrierLogDpsSchema.safeParse(body);
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
    const result = await upsertCarrierLogDps(parsed.data);
    return NextResponse.json({
      ok: true,
      pageId: result.pageId,
      classification: result.classification,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save carrier log";
    return NextResponse.json({ error: message }, { status: 500 });
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

  const parsed = carrierLogDpsPreviewSchema.safeParse(body);
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
    const classification = await previewCarrierLogDps({
      date: parsed.data.date,
      dpsCount: parsed.data.dpsCount,
    });
    return NextResponse.json({ classification });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to preview DPS classification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
