import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // We run `npm run lint` in CI locally; Next's build-time lint currently
    // trips over ESLint option differences across versions.
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
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
