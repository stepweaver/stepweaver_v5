import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Browsers request /favicon.ico; middleware skips *.ico, so use a config redirect to app icon.
      { source: "/favicon.ico", destination: "/icon", permanent: false },
      { source: "/projects/cerebro", destination: "/projects/lcerebro", permanent: true },
      { source: "/projects/cashflow-ledger", destination: "/projects/bill-planner", permanent: true },
      { source: "/projects/dice-roller", destination: "/projects/rpg-dice-roller", permanent: true },
      { source: "/projects/lambda-heating-air", destination: "/projects/service-business-demo", permanent: true },
      { source: "/projects/terminal-ui", destination: "/projects/portfolio-terminal", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.notion.so" },
      { protocol: "https", hostname: "**.s3.amazonaws.com" },
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
