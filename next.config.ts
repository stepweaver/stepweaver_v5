import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // We run `npm run lint` in CI locally; Next's build-time lint currently
    // trips over ESLint option differences across versions.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/weaver_resume.pdf",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Stephen_Weaver_Resume.pdf"',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Legacy project slug aliases (before catch-all)
      { source: "/projects/cerebro", destination: "/work/lcerebro", permanent: true },
      { source: "/projects/cashflow-ledger", destination: "/work/bill-planner", permanent: true },
      { source: "/projects/dice-roller", destination: "/work/rpg-dice-roller", permanent: true },
      { source: "/projects/lambda-heating-air", destination: "/work/service-business-demo", permanent: true },
      { source: "/projects/terminal-ui", destination: "/work/portfolio-terminal", permanent: true },

      // IA renames (hiring-first clarity)
      { source: "/projects", destination: "/work", permanent: true },
      { source: "/projects/:slug", destination: "/work/:slug", permanent: true },
      { source: "/brief", destination: "/about", permanent: true },
      { source: "/codex", destination: "/writing", permanent: true },
      { source: "/codex/:slug", destination: "/writing/:slug", permanent: true },
      { source: "/start-here", destination: "/", permanent: true },
      { source: "/capabilities", destination: "/about", permanent: true },
      { source: "/play", destination: "/lab", permanent: true },
      { source: "/play/:path*", destination: "/lab", permanent: true },

      // Legacy aliases under new /work path (in case old redirects were bookmarked after partial migrate)
      { source: "/work/cerebro", destination: "/work/lcerebro", permanent: true },
      { source: "/work/cashflow-ledger", destination: "/work/bill-planner", permanent: true },
      { source: "/work/dice-roller", destination: "/work/rpg-dice-roller", permanent: true },
      { source: "/work/lambda-heating-air", destination: "/work/service-business-demo", permanent: true },
      { source: "/work/terminal-ui", destination: "/work/portfolio-terminal", permanent: true },

      // Retired SMB service lanes → consolidated services
      { source: "/services/reviews", destination: "/services", permanent: true },
      { source: "/services/follow-up", destination: "/services", permanent: true },
      { source: "/services/ops", destination: "/services", permanent: true },
      { source: "/services/web-intake", destination: "/services", permanent: true },
      { source: "/services/automation", destination: "/services", permanent: true },
      { source: "/services/lead-systems", destination: "/services", permanent: true },
      // Field Journal rename (ethics sanitization)
      { source: "/carrier-journal", destination: "/field-journal", permanent: true },
      { source: "/carrier-journal/:path*", destination: "/field-journal/:path*", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.notion.so" },
      { protocol: "https", hostname: "**.s3.amazonaws.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons"],
    // Disabled: experimental view transitions have caused hard-to-debug dev crashes / blank pages on some Next 15.x builds.
    // viewTransition: true,
  },
  compress: true,
};

export default nextConfig;
