import type { MetadataRoute } from "next";
import {
  PWA_BACKGROUND_COLOR,
  PWA_DESCRIPTION,
  PWA_ICON_FILES,
  PWA_NAME,
  PWA_SHORT_NAME,
  PWA_THEME_COLOR,
} from "@/lib/site/pwa";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: PWA_NAME,
    short_name: PWA_SHORT_NAME,
    description: PWA_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: PWA_BACKGROUND_COLOR,
    theme_color: PWA_THEME_COLOR,
    lang: "en",
    icons: [
      {
        src: PWA_ICON_FILES.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_ICON_FILES.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_ICON_FILES.maskable192,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: PWA_ICON_FILES.maskable512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: PWA_ICON_FILES.appleTouch,
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
