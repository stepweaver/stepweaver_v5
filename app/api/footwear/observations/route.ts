import { NextResponse } from "next/server";
import {
  createObservationSchema,
  updateObservationSchema,
} from "@/lib/validation/footwear.schema";
import {
  assertFootwearReady,
  footwearBadRequest,
  readJsonBody,
} from "@/lib/footwear/api";
import {
  createObservation,
  getObservationById,
  getObservationsForShoe,
  getShoeById,
  getShoeMileageTotal,
  updateObservation,
} from "@/lib/footwear/queries";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsedBody = await readJsonBody(request);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = createObservationSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return footwearBadRequest("Validation failed", parsed.error.flatten());
  }

  const gate = assertFootwearReady(parsed.data.logSecret);
  if (gate) return gate;

  const data = parsed.data;
  const shoe = await getShoeById(data.shoeId);
  if (!shoe) {
    return NextResponse.json({ error: "Shoe not found" }, { status: 404 });
  }

  if (data.entryType === "checkpoint") {
    if (data.checkpointMiles == null) {
      return footwearBadRequest("Checkpoint assessments require checkpointMiles.");
    }
    const existing = await getObservationsForShoe(data.shoeId);
    const duplicate = existing.find(
      (o) =>
        o.entryType === "checkpoint" && o.checkpointMiles === data.checkpointMiles
    );
    if (duplicate) {
      return footwearBadRequest(
        `Checkpoint at ${data.checkpointMiles} mi already exists for this shoe.`
      );
    }
  }

  const shoeMileageAtEntry = await getShoeMileageTotal(data.shoeId);

  try {
    const { logSecret: _s, ...rest } = data;
    const observation = await createObservation({
      ...rest,
      shoeMileageAtEntry: String(shoeMileageAtEntry),
      title: rest.title,
      checkpointMiles: rest.checkpointMiles,
    });
    return NextResponse.json({ ok: true, observation }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create observation";
    if (message.includes("unique") || message.includes("duplicate")) {
      return footwearBadRequest("Duplicate checkpoint for this shoe.");
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const parsedBody = await readJsonBody(request);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = updateObservationSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return footwearBadRequest("Validation failed", parsed.error.flatten());
  }

  const gate = assertFootwearReady(parsed.data.logSecret);
  if (gate) return gate;

  const { logSecret: _s, id, ...patch } = parsed.data;
  const existing = await getObservationById(id);
  if (!existing) {
    return NextResponse.json({ error: "Observation not found" }, { status: 404 });
  }

  if (
    existing.entryType === "checkpoint" &&
    patch.checkpointMiles != null &&
    patch.checkpointMiles !== existing.checkpointMiles
  ) {
    const siblings = await getObservationsForShoe(existing.shoeId);
    const duplicate = siblings.find(
      (o) =>
        o.id !== id &&
        o.entryType === "checkpoint" &&
        o.checkpointMiles === patch.checkpointMiles
    );
    if (duplicate) {
      return footwearBadRequest(
        `Checkpoint at ${patch.checkpointMiles} mi already exists for this shoe.`
      );
    }
  }

  try {
    const observation = await updateObservation(id, patch);
    if (!observation) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, observation });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update observation";
    if (message.includes("unique") || message.includes("duplicate")) {
      return footwearBadRequest("Duplicate checkpoint for this shoe.");
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
