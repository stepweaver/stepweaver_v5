import { ImageResponse } from "next/og";

// fallow-ignore-next-line unused-export
export const runtime = "edge";

export const size = { width: 32, height: 32 };

export const contentType = "image/png";

/** Default app icon. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050b12",
          color: "#5aff8c",
          fontSize: 22,
          fontFamily:
            'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
        }}
      >
        λ
      </div>
    ),
    { ...size }
  );
}
