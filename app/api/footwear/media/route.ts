import { NextResponse } from "next/server";
import { mediaRegisterSchema } from "@/lib/validation/footwear.schema";
import {
  assertFootwearReady,
  footwearBadRequest,
  readJsonBody,
} from "@/lib/footwear/api";
import {
  createMedia,
  getObservationById,
  getShoeById,
  getShoeMileageTotal,
} from "@/lib/footwear/queries";

export const dynamic = "force-dynamic";

/**
 * Registers a Blob URL already uploaded from the browser.
 * Files go directly to Vercel Blob (client upload) to avoid the 4.5MB
 * Function body limit that caused HTTP 413 for phone JPEGs.
 */
export async function POST(request: Request) {
  const parsedBody = await readJsonBody(request);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = mediaRegisterSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return footwearBadRequest("Validation failed", parsed.error.flatten());
  }

  const gate = assertFootwearReady(parsed.data.logSecret);
  if (gate) return gate;

  if (!(process.env.BLOB_READ_WRITE_TOKEN ?? "").trim()) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured" },
      { status: 503 }
    );
  }

  const shoe = await getShoeById(parsed.data.shoeId);
  if (!shoe) {
    return NextResponse.json({ error: "Shoe not found" }, { status: 404 });
  }

  const imageUrl = parsed.data.imageUrl;
  if (
    !imageUrl.includes("blob.vercel-storage.com/") ||
    !imageUrl.includes(`/footwear/${shoe.slug}/`)
  ) {
    return footwearBadRequest("Image URL is not a valid Footwear Lab blob.");
  }

  const isHero = parsed.data.imageType === "hero";
  let observationId = parsed.data.observationId;
  let mileageAtPhoto: string;

  if (isHero) {
    observationId = undefined;
    mileageAtPhoto = "0";
  } else if (observationId) {
    const obs = await getObservationById(observationId);
    if (!obs || obs.shoeId !== shoe.id) {
      return footwearBadRequest("Observation not found for this shoe.");
    }
    mileageAtPhoto = String(obs.checkpointMiles ?? obs.shoeMileageAtEntry);
  } else {
    mileageAtPhoto = String(await getShoeMileageTotal(shoe.id));
  }

  const media = await createMedia({
    shoeId: shoe.id,
    observationId,
    imageUrl,
    imageType: parsed.data.imageType,
    mileageAtPhoto,
    caption: parsed.data.caption,
    altText:
      parsed.data.altText ??
      `${shoe.brand} ${shoe.model} ${parsed.data.imageType}`,
    sortOrder: parsed.data.sortOrder,
    public: parsed.data.public,
  });

  return NextResponse.json({ ok: true, media }, { status: 201 });
}
