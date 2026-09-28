import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import {
  COLOR_SCHEME_STORAGE_KEY,
  LEGACY_THEME_STORAGE_KEY,
} from "@/lib/theme/color-scheme";
import { PWA_DESCRIPTION, PWA_ICON_FILES, PWA_NAME, PWA_SHORT_NAME } from "@/lib/site/pwa";
import { META_COLOR_DARK, META_COLOR_LIGHT } from "@/lib/theme/themes";
import { AppChrome } from "@/components/app-chrome";
import { ErrorBoundary } from "@/components/error-boundary";
import { Analytics } from "@/components/analytics";
import "./globals.css";

const ocr = localFont({
  src: "./fonts/OCRA.woff",
  variable: "--font-ocr",
  display: "swap",
});

const ibm = localFont({
  src: "./fonts/IBM_3270.woff",
  variable: "--font-ibm",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "stepweaver.dev",
    template: "%s | stepweaver.dev",
  },
  description: PWA_DESCRIPTION,
  applicationName: PWA_NAME,
  metadataBase: new URL(process.env.SITE_URL || "https://stepweaver.dev"),
  appleWebApp: {
    capable: true,
    title: PWA_SHORT_NAME,
    statusBarStyle: "black-translucent",
  },
  // Safari still reads this name. Next emits the standard tag, not the Apple one.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: PWA_ICON_FILES.icon32, sizes: "32x32", type: "image/png" },
      { url: PWA_ICON_FILES.icon192, sizes: "192x192", type: "image/png" },
      { url: PWA_ICON_FILES.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: PWA_ICON_FILES.appleTouch, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "stepweaver.dev",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: META_COLOR_LIGHT },
    { media: "(prefers-color-scheme: dark)", color: META_COLOR_DARK },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={`${ocr.variable} ${ibm.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = null;
                  try {
                    stored = localStorage.getItem(${JSON.stringify(COLOR_SCHEME_STORAGE_KEY)});
                  } catch (_) {}

                  if (stored !== "light" && stored !== "dark") {
                    try {
                      var legacy = localStorage.getItem(${JSON.stringify(LEGACY_THEME_STORAGE_KEY)});
                      if (legacy === "light" || legacy === "dark") stored = legacy;
                    } catch (_) {}
                  }

                  if (stored === "light" || stored === "dark") {
                    document.documentElement.setAttribute("data-theme", stored);
                    var color = stored === "light"
                      ? ${JSON.stringify(META_COLOR_LIGHT)}
                      : ${JSON.stringify(META_COLOR_DARK)};
                    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
                      meta.setAttribute("content", color);
                    });
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ErrorBoundary>
          <AppChrome>
            <main id="main-content">{children}</main>
          </AppChrome>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
