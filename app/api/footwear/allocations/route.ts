import { NextResponse } from "next/server";
import { createAllocationSchema } from "@/lib/validation/footwear.schema";
import {
  assertFootwearReady,
  footwearBadRequest,
  readJsonBody,
} from "@/lib/footwear/api";
import { createAllocation, getShoeById } from "@/lib/footwear/queries";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsedBody = await readJsonBody(request);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = createAllocationSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return footwearBadRequest("Validation failed", parsed.error.flatten());
  }

  const gate = assertFootwearReady(parsed.data.logSecret);
  if (gate) return gate;

  const shoe = await getShoeById(parsed.data.shoeId);
  if (!shoe) {
    return NextResponse.json({ error: "Shoe not found" }, { status: 404 });
  }

  if (parsed.data.miles < 0) {
    return footwearBadRequest("Mileage cannot be negative.");
  }

  const allocation = await createAllocation({
    shoeId: parsed.data.shoeId,
    date: parsed.data.date,
    miles: parsed.data.miles,
    mileageType: parsed.data.mileageType,
    notes: parsed.data.notes,
  });

  return NextResponse.json({ ok: true, allocation }, { status: 201 });
}
