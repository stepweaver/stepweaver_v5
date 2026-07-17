import { NextResponse } from "next/server";
import { retireShoeSchema } from "@/lib/validation/footwear.schema";
import {
  assertFootwearReady,
  footwearBadRequest,
  readJsonBody,
} from "@/lib/footwear/api";
import {
  createObservation,
  getShoeById,
  getShoeMileageTotal,
  updateShoe,
} from "@/lib/footwear/queries";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsedBody = await readJsonBody(request);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = retireShoeSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return footwearBadRequest("Validation failed", parsed.error.flatten());
  }

  const gate = assertFootwearReady(parsed.data.logSecret);
  if (gate) return gate;

  const data = parsed.data;
  const shoe = await getShoeById(data.id);
  if (!shoe) {
    return NextResponse.json({ error: "Shoe not found" }, { status: 404 });
  }

  if (shoe.firstWearDate && data.retirementDate < shoe.firstWearDate) {
    return footwearBadRequest(
      "A shoe cannot be retired before its first-wear date."
    );
  }

  const mileage = await getShoeMileageTotal(shoe.id);
  const status = data.finalVerdict === "failed" ? "failed" : "retired";

  const updated = await updateShoe(shoe.id, {
    status,
    retirementDate: data.retirementDate,
    retirementReason: data.retirementReason,
    retiredFromWorkOnly: data.retiredFromWorkOnly,
    failureLocation: data.failureLocation,
    wouldBuyAgain: data.wouldBuyAgain,
    idealUser: data.idealUser,
    whoShouldAvoid: data.whoShouldAvoid,
    finalVerdict: data.finalVerdict,
    finalReview: data.finalReview,
    postWorkStatus: data.postWorkStatus,
    public: data.public ?? shoe.public,
  });

  const observation = await createObservation({
    shoeId: shoe.id,
    date: data.retirementDate,
    entryType: "retirement",
    shoeMileageAtEntry: String(mileage),
    title: "Retirement report",
    notes: data.finalReview,
    cushioning: data.cushioning,
    stability: data.stability,
    comfort: data.comfort,
    durability: data.durability,
    outsoleWear: data.outsoleWear,
    midsoleWear: data.midsoleWear,
    public: data.public ?? shoe.public,
    retrospective: false,
  });

  return NextResponse.json({ ok: true, shoe: updated, observation });
}
