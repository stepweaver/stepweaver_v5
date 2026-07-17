import { NextResponse } from "next/server";
import {
  createShoeSchema,
  updateShoeSchema,
  setActiveShoeSchema,
} from "@/lib/validation/footwear.schema";
import {
  assertFootwearReady,
  footwearBadRequest,
  readJsonBody,
} from "@/lib/footwear/api";
import {
  createShoe,
  createAllocation,
  listShoeSummaries,
  updateShoe,
  setActiveShoe,
  getShoeById,
} from "@/lib/footwear/queries";
import { slugifyShoe } from "@/lib/footwear/id";
import { listShoes } from "@/lib/footwear/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("logSecret") ?? "";
  const gate = assertFootwearReady(secret);
  if (gate) return gate;

  const summaries = await listShoeSummaries();
  return NextResponse.json({
    ok: true,
    shoes: summaries.map((s) => ({
      ...s.shoe,
      mileage: s.mileage,
      level: s.level,
      nextCheckpoint: s.nextCheckpoint,
      milesRemaining: s.milesRemaining,
      progressPercent: s.progressPercent,
      conditionLabel: s.conditionLabel,
      heroImageUrl: s.heroImageUrl,
    })),
  });
}

export async function POST(request: Request) {
  const parsedBody = await readJsonBody(request);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = createShoeSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return footwearBadRequest("Validation failed", parsed.error.flatten());
  }

  const gate = assertFootwearReady(parsed.data.logSecret);
  if (gate) return gate;

  const data = parsed.data;
  let slug = data.slug;
  if (!slug) {
    const existing = await listShoes();
    const sameModel = existing.filter(
      (s) =>
        s.brand.toLowerCase() === data.brand.toLowerCase() &&
        s.model.toLowerCase() === data.model.toLowerCase()
    );
    slug = slugifyShoe(data.brand, data.model, sameModel.length + 1);
  }

  try {
    const shoe = await createShoe({
      brand: data.brand,
      model: data.model,
      nickname: data.nickname,
      slug,
      colorway: data.colorway,
      size: data.size,
      width: data.width,
      purchaseDate: data.purchaseDate,
      firstWearDate: data.firstWearDate,
      status: data.status,
      acquisitionType: data.acquisitionType,
      retailPrice:
        data.retailPrice != null ? String(data.retailPrice) : undefined,
      amountPaid: data.amountPaid != null ? String(data.amountPaid) : undefined,
      provider: data.provider,
      intendedUse: data.intendedUse,
      baselineNotes: data.baselineNotes,
      isLegacyRecord: data.isLegacyRecord,
      mileageConfidence: data.mileageConfidence,
      public: data.public,
    });

    const seedDate = data.firstWearDate ?? data.purchaseDate ?? new Date().toISOString().slice(0, 10);

    if (data.estimatedWorkMiles && data.estimatedWorkMiles > 0) {
      await createAllocation({
        shoeId: shoe.id,
        date: seedDate,
        miles: data.estimatedWorkMiles,
        mileageType: "estimated",
        notes: data.isLegacyRecord
          ? "Legacy estimated work mileage prior to Footwear Lab."
          : "Estimated work mileage seed.",
      });
    }

    if (data.estimatedPersonalMiles && data.estimatedPersonalMiles > 0) {
      await createAllocation({
        shoeId: shoe.id,
        date: seedDate,
        miles: data.estimatedPersonalMiles,
        mileageType: "personal",
        notes: data.isLegacyRecord
          ? "Legacy estimated personal mileage."
          : "Estimated personal mileage seed.",
      });
    }

    return NextResponse.json({ ok: true, shoe }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create shoe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const parsedBody = await readJsonBody(request);
  if (!parsedBody.ok) return parsedBody.response;

  const body = parsedBody.body as Record<string, unknown>;
  if (body && body.action === "setActive") {
    const parsed = setActiveShoeSchema.safeParse(body);
    if (!parsed.success) {
      return footwearBadRequest("Validation failed", parsed.error.flatten());
    }
    const gate = assertFootwearReady(parsed.data.logSecret);
    if (gate) return gate;
    const shoe = await setActiveShoe(parsed.data.id);
    if (!shoe) {
      return NextResponse.json({ error: "Shoe not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, shoe });
  }

  const parsed = updateShoeSchema.safeParse(body);
  if (!parsed.success) {
    return footwearBadRequest("Validation failed", parsed.error.flatten());
  }

  const gate = assertFootwearReady(parsed.data.logSecret);
  if (gate) return gate;

  const existing = await getShoeById(parsed.data.id);
  if (!existing) {
    return NextResponse.json({ error: "Shoe not found" }, { status: 404 });
  }

  const { logSecret: _s, id, ...patch } = parsed.data;
  const shoe = await updateShoe(id, {
    ...patch,
    retailPrice:
      patch.retailPrice === null
        ? null
        : patch.retailPrice != null
          ? String(patch.retailPrice)
          : undefined,
    amountPaid:
      patch.amountPaid === null
        ? null
        : patch.amountPaid != null
          ? String(patch.amountPaid)
          : undefined,
  });

  return NextResponse.json({ ok: true, shoe });
}
