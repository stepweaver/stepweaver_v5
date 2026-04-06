import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
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
  description: "Technical operator. Systems builder. Lambda architecture.",
  metadataBase: new URL(process.env.SITE_URL || "https://stepweaver.dev"),
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
  themeColor: "#050b12",
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
      data-theme="dark"
      className={`${ocr.variable} ${ibm.variable} theme-loaded`}
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
                  var VALID_THEMES = [
                    "dark",
                    "light",
                    "monochrome",
                    "monochrome-inverted",
                    "vintage",
                    "apple",
                    "c64",
                    "amber",
                    "synthwave",
                    "dracula",
                    "solarized",
                    "nord",
                    "cobalt",
                    "skynet"
                  ];

                  var META_COLORS = {
                    dark: "#050b12",
                    light: "#f5f7fa",
                    monochrome: "#0f0f0f",
                    "monochrome-inverted": "#f0f0f0",
                    vintage: "#19160f",
                    apple: "#f5f5f7",
                    c64: "#221b54",
                    amber: "#0f0c05",
                    synthwave: "#0f081e",
                    dracula: "#191923",
                    solarized: "#fdf6e3",
                    nord: "#1e222e",
                    cobalt: "#0a121e",
                    skynet: "#0f0505"
                  };

                  var stored = null;
                  try {
                    stored = localStorage.getItem("theme");
                  } catch (_) {}

                  var theme = VALID_THEMES.indexOf(stored) >= 0
                    ? stored
                    : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

                  document.documentElement.setAttribute("data-theme", theme);
                  document.documentElement.classList.add("theme-loaded");

                  var meta = document.querySelector('meta[name="theme-color"]');
                  if (meta) {
                    meta.setAttribute("content", META_COLORS[theme] || META_COLORS.dark);
                  }
                } catch (_) {
                  document.documentElement.setAttribute("data-theme", "dark");
                  document.documentElement.classList.add("theme-loaded");
                  var meta = document.querySelector('meta[name="theme-color"]');
                  if (meta) {
                    meta.setAttribute("content", "#050b12");
                  }
                }
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
          <ThemeProvider>
            <AppChrome>
              <main id="main-content">{children}</main>
            </AppChrome>
          </ThemeProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}