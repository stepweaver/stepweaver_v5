import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { mediaMetaSchema } from "@/lib/validation/footwear.schema";
import {
  assertFootwearReady,
  footwearBadRequest,
} from "@/lib/footwear/api";
import {
  createMedia,
  getShoeById,
  getShoeMileageTotal,
} from "@/lib/footwear/queries";
import { createId } from "@/lib/footwear/id";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const metaRaw = form.get("meta");

  if (!(file instanceof File)) {
    return footwearBadRequest("Missing image file.");
  }
  if (typeof metaRaw !== "string") {
    return footwearBadRequest("Missing meta JSON.");
  }

  let metaJson: unknown;
  try {
    metaJson = JSON.parse(metaRaw);
  } catch {
    return footwearBadRequest("Invalid meta JSON.");
  }

  const parsed = mediaMetaSchema.safeParse(metaJson);
  if (!parsed.success) {
    return footwearBadRequest("Validation failed", parsed.error.flatten());
  }

  const gate = assertFootwearReady(parsed.data.logSecret);
  if (gate) return gate;

  if (!ALLOWED.has(file.type)) {
    return footwearBadRequest("Only JPEG, PNG, and WebP images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    return footwearBadRequest("Image must be 5MB or smaller.");
  }

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

  const mileage = await getShoeMileageTotal(shoe.id);
  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `footwear/${shoe.slug}/${createId("img")}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  const media = await createMedia({
    shoeId: shoe.id,
    observationId: parsed.data.observationId,
    imageUrl: blob.url,
    imageType: parsed.data.imageType,
    mileageAtPhoto: String(mileage),
    caption: parsed.data.caption,
    altText: parsed.data.altText ?? `${shoe.brand} ${shoe.model} ${parsed.data.imageType}`,
    sortOrder: parsed.data.sortOrder,
    public: parsed.data.public,
  });

  return NextResponse.json({ ok: true, media }, { status: 201 });
}
