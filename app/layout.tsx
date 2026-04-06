import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
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
  themeColor: "#0a0a0a",
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
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  var themes = ['dark','light','monochrome','monochrome-inverted','vintage','apple','c64','amber','synthwave','dracula','solarized','nord','cobalt','skynet'];
                  if (!t || !themes.includes(t)) {
                    t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  }
                  document.documentElement.setAttribute('data-theme', t);
                  var metaColors = {dark:'#0a0a0a',light:'#f5f5f5',monochrome:'#0f0f0f','monochrome-inverted':'#f0f0f0',vintage:'#19160f',apple:'#f5f5f5',c64:'#2828a0',amber:'#0f0c05',synthwave:'#0f081e',dracula:'#191923',solarized:'#fdf6e3',nord:'#1e222e',cobalt:'#0a121e',skynet:'#0f0505'};
                  var mc = document.querySelector('meta[name="theme-color"]');
                  if (mc) mc.content = metaColors[t] || '#0a0a0a';
                  document.documentElement.classList.add('theme-loaded');
                } catch(e) {
                  document.documentElement.classList.add('theme-loaded');
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
            <main id="main-content">{children}</main>
          </ThemeProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
