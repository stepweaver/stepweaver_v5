import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { assertFootwearReady } from "@/lib/footwear/api";
import { footwearAuthSchema } from "@/lib/validation/footwear.schema";

export const dynamic = "force-dynamic";

const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        if (!(process.env.BLOB_READ_WRITE_TOKEN ?? "").trim()) {
          throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
        }

        let payload: unknown = {};
        if (clientPayload) {
          try {
            payload = JSON.parse(clientPayload);
          } catch {
            throw new Error("Invalid upload payload.");
          }
        }

        const parsed = footwearAuthSchema.safeParse(payload);
        if (!parsed.success) {
          throw new Error("Missing log secret.");
        }

        const gate = assertFootwearReady(parsed.data.logSecret);
        if (gate) {
          throw new Error("Unauthorized");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({ ok: true }),
        };
      },
      onUploadCompleted: async () => {
        // DB registration is done by the client after upload so local
        // development works without a public tunnel for Blob webhooks.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Upload token failed" },
      { status: 400 }
    );
  }
}
