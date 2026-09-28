/**
 * Build homescreen / favicon PNGs from the lambda mark.
 * Source: public/images/lambda_stepweaver.png
 * Run: npm run icons:render
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { PWA_BACKGROUND_COLOR, PWA_ICON_FILES } from "../lib/site/pwa";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "public/images/lambda_stepweaver.png");

const ANY_HEIGHT_RATIO = 0.82;
const MASKABLE_HEIGHT_RATIO = 0.58;

type Rgba = { r: number; g: number; b: number; alpha: number };

function background(): Rgba {
  const hex = PWA_BACKGROUND_COLOR.replace("#", "");
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
    alpha: 1,
  };
}

async function extractGlyph(): Promise<Buffer> {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      if (g > 80 && g > r + 30 && g > b + 30) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  const pad = 8;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const width = Math.min(info.width - left, maxX - minX + 1 + pad * 2);
  const height = Math.min(info.height - top, maxY - minY + 1 + pad * 2);

  return sharp(sourcePath).extract({ left, top, width, height }).png().toBuffer();
}

async function squareIcon(glyph: Buffer, size: number, heightRatio: number): Promise<Buffer> {
  const meta = await sharp(glyph).metadata();
  const glyphWidth = meta.width ?? 1;
  const glyphHeight = meta.height ?? 1;
  let targetH = Math.round(size * heightRatio);
  let targetW = Math.round(targetH * (glyphWidth / glyphHeight));
  const maxEdge = Math.round(size * 0.9);
  if (targetW > maxEdge || targetH > maxEdge) {
    const scale = maxEdge / Math.max(targetW, targetH);
    targetW = Math.round(targetW * scale);
    targetH = Math.round(targetH * scale);
  }

  const resized = await sharp(glyph).resize(targetW, targetH, { fit: "fill" }).png().toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background(),
    },
  })
    .composite([{ input: resized, gravity: "centre" }])
    .png()
    .toBuffer();
}

/** Vista-style ICO: one or more PNG payloads. Width/height 0 means 256. */
function pngsToIco(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = Buffer.alloc(16 * images.length);
  let offset = 6 + entries.length;
  for (let i = 0; i < images.length; i++) {
    const image = images[i]!;
    const entry = i * 16;
    const dim = image.size >= 256 ? 0 : image.size;
    entries.writeUInt8(dim, entry);
    entries.writeUInt8(dim, entry + 1);
    entries.writeUInt16LE(1, entry + 4);
    entries.writeUInt16LE(32, entry + 6);
    entries.writeUInt32LE(image.png.length, entry + 8);
    entries.writeUInt32LE(offset, entry + 12);
    offset += image.png.length;
  }

  return Buffer.concat([header, entries, ...images.map((image) => image.png)]);
}

function publicFile(urlPath: string): string {
  return resolve(root, "public", urlPath.replace(/^\//, ""));
}

/** Next serves `app/favicon.ico` at `/favicon.ico`. A second copy in `public/` conflicts. */
function faviconFile(): string {
  return resolve(root, "app/favicon.ico");
}

async function writePng(urlPath: string, png: Buffer) {
  const file = publicFile(urlPath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, png);
  console.log(`${urlPath}  ${png.length} bytes`);
}

async function main() {
  const glyph = await extractGlyph();
  const any32 = await squareIcon(glyph, 32, ANY_HEIGHT_RATIO);
  const any16 = await squareIcon(glyph, 16, ANY_HEIGHT_RATIO);
  const any180 = await squareIcon(glyph, 180, ANY_HEIGHT_RATIO);
  const any192 = await squareIcon(glyph, 192, ANY_HEIGHT_RATIO);
  const any512 = await squareIcon(glyph, 512, ANY_HEIGHT_RATIO);
  const mask192 = await squareIcon(glyph, 192, MASKABLE_HEIGHT_RATIO);
  const mask512 = await squareIcon(glyph, 512, MASKABLE_HEIGHT_RATIO);

  await writePng(PWA_ICON_FILES.icon32, any32);
  await writePng(PWA_ICON_FILES.appleTouch, any180);
  await writePng(PWA_ICON_FILES.icon192, any192);
  await writePng(PWA_ICON_FILES.icon512, any512);
  await writePng(PWA_ICON_FILES.maskable192, mask192);
  await writePng(PWA_ICON_FILES.maskable512, mask512);

  const ico = pngsToIco([
    { size: 16, png: any16 },
    { size: 32, png: any32 },
  ]);
  writeFileSync(faviconFile(), ico);
  console.log(`${PWA_ICON_FILES.favicon} -> app/favicon.ico  ${ico.length} bytes`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
