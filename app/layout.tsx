import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import { AppChrome } from "@/components/app-chrome";
import { ErrorBoundary } from "@/components/error-boundary";
import { Analytics } from "@/components/analytics";
import { META_COLORS, THEMES } from "@/lib/theme/themes";

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
  themeColor: META_COLORS.dark,
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const themeInitScript = `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  var themes = ${JSON.stringify(THEMES)};
                  if (!t || !themes.includes(t)) {
                    t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  }
                  document.documentElement.setAttribute('data-theme', t);
                  var metaColors = ${JSON.stringify(META_COLORS)};
                  var mc = document.querySelector('meta[name="theme-color"]');
                  if (mc) mc.content = metaColors[t] || '${META_COLORS.dark}';
                  document.documentElement.classList.add('theme-loaded');
                } catch(e) {
                  document.documentElement.classList.add('theme-loaded');
                }
              })();
            `;

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
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
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
