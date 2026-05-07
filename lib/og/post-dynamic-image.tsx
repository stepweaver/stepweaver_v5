import { headers } from "next/headers";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "stepweaver.dev post preview";

type PostDynamicImageOptions = {
  title: string;
  eyebrow?: string;
};

function clampText(input: string, max = 140): string {
  const s = (input || "").trim().replace(/\s+/g, " ");
  if (!s) return "Untitled";
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

export async function renderPostDynamicImage({ title, eyebrow }: PostDynamicImageOptions) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "stepweaver.dev";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const baseUrl = `${proto}://${host}`;

  const safeTitle = clampText(title, 140);
  const safeEyebrow = clampText(eyebrow || "stepweaver.dev", 48);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "72px",
          backgroundColor: "#05070c",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 420px at 18% 22%, rgba(70, 255, 220, 0.18), rgba(0,0,0,0) 60%), radial-gradient(720px 520px at 84% 14%, rgba(122, 92, 255, 0.20), rgba(0,0,0,0) 60%), radial-gradient(980px 680px at 58% 88%, rgba(255, 46, 99, 0.12), rgba(0,0,0,0) 62%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5,7,12,0.18) 0%, rgba(5,7,12,0.65) 42%, rgba(5,7,12,0.96) 100%)",
          }}
        />

        <div style={{ position: "absolute", left: 72, right: 72, top: 64, display: "flex" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "rgba(215, 255, 245, 0.86)",
              fontSize: 20,
              letterSpacing: 1.6,
              textTransform: "uppercase",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#46ffdc" }} />
            <div style={{ opacity: 0.92 }}>{safeEyebrow}</div>
          </div>

          <div style={{ marginLeft: "auto", color: "rgba(200, 220, 255, 0.55)", fontSize: 18 }}>
            {baseUrl}
          </div>
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              color: "rgba(233, 255, 250, 0.96)",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            {safeTitle}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 18, height: 2, backgroundColor: "rgba(70,255,220,0.92)" }} />
            <div style={{ width: 52, height: 2, backgroundColor: "rgba(70,255,220,0.34)" }} />
            <div style={{ width: 130, height: 2, backgroundColor: "rgba(70,255,220,0.16)" }} />
          </div>

          <div style={{ color: "rgba(172, 195, 255, 0.55)", fontSize: 22, letterSpacing: 0.6 }}>
            stepweaver.dev
          </div>
        </div>
      </div>
    ),
    size
  );
}

