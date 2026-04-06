import { headers } from "next/headers";
import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/lib/data/projects";
import { chooseProjectSharePath } from "@/lib/og/project-share-path";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Project case study preview";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "stepweaver.dev";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const baseUrl = `${proto}://${host}`;

  const project = getProjectBySlug(slug);
  const title = project?.title || "Project case study";
  const chosen = chooseProjectSharePath(project?.imageUrl);
  const imageSrc =
    chosen.startsWith("http://") || chosen.startsWith("https://") ? chosen : `${baseUrl}${chosen}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#05070c",
        }}
      >
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={title}
            width={1200}
            height={630}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    ),
    size
  );
}
