/** Resize/compress an image in the browser so phone JPEGs upload reliably. */

const MAX_EDGE = 2400;
const JPEG_QUALITY = 0.82;

function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  // iPhone often omits MIME or uses HEIC; trust common extensions.
  return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name);
}

export async function compressImageForUpload(file: File): Promise<File> {
  if (!isImageFile(file)) {
    throw new Error("Only image files are allowed.");
  }

  const isHeic =
    /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

  // Already small enough and not HEIC; keep original.
  // HEIC must be re-encoded so blob storage / browsers can display it.
  if (!isHeic && file.size <= 1.5 * 1024 * 1024) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    if (isHeic) {
      throw new Error(
        "Could not read this HEIC photo. In iPhone Settings → Camera → Formats, try Most Compatible, or export/share as JPEG."
      );
    }
    throw new Error("Could not read this image. Try a different photo.");
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
  if (!blob) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}
