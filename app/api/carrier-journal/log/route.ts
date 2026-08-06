import { NextRequest, NextResponse } from "next/server";
import {
  isCarrierJournalLogEnabled,
  previewCarrierLogDps,
  upsertCarrierLogDps,
} from "@/lib/notion/carrier-journal.repo";
import {
  applyNoStoreHeaders,
  isCarrierSessionRequest,
  isSameOriginRequest,
} from "@/lib/carrier-journal/auth";
import {
  carrierLogDpsPreviewSchema,
  carrierLogDpsSchema,
} from "@/lib/validation/carrier-log.schema";

function unauthorized() {
  return applyNoStoreHeaders(
    NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  );
}

function unavailable() {
  return applyNoStoreHeaders(
    NextResponse.json(
      { error: "Carrier log API is not configured" },
      { status: 503 },
    ),
  );
}

function gate(request: NextRequest): NextResponse | null {
  if (!isCarrierJournalLogEnabled()) return unavailable();
  if (!isSameOriginRequest(request)) {
    return applyNoStoreHeaders(
      NextResponse.json({ error: "Request rejected." }, { status: 403 }),
    );
  }
  if (!isCarrierSessionRequest(request)) return unauthorized();
  return null;
}

export async function POST(request: NextRequest) {
  const blocked = gate(request);
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return applyNoStoreHeaders(
      NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    );
  }

  const parsed = carrierLogDpsSchema.safeParse(body);
  if (!parsed.success) {
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      ),
    );
  }

  try {
    const result = await upsertCarrierLogDps(parsed.data);
    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        pageId: result.pageId,
        classification: result.classification,
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save carrier log";
    return applyNoStoreHeaders(
      NextResponse.json({ error: message }, { status: 500 }),
    );
  }
}

export async function PUT(request: NextRequest) {
  const blocked = gate(request);
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return applyNoStoreHeaders(
      NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    );
  }

  const parsed = carrierLogDpsPreviewSchema.safeParse(body);
  if (!parsed.success) {
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      ),
    );
  }

  try {
    const classification = await previewCarrierLogDps({
      date: parsed.data.date,
      dpsCount: parsed.data.dpsCount,
    });
    return applyNoStoreHeaders(NextResponse.json({ classification }));
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to preview DPS classification";
    return applyNoStoreHeaders(
      NextResponse.json({ error: message }, { status: 500 }),
    );
  }
}
