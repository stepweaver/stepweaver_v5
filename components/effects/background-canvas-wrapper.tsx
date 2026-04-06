"use client";

import dynamic from "next/dynamic";

const BackgroundCanvas = dynamic(
  () => import("./background-canvas").then((m) => m.BackgroundCanvas),
  { ssr: false }
);

export function BackgroundCanvasWrapper() {
  return <BackgroundCanvas />;
}
