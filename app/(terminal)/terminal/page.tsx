import type { Metadata } from "next";
import { TerminalPageClient } from "@/components/terminal/terminal-page-client";

export const metadata: Metadata = {
  title: "Terminal",
  description: "Browser-based command interface for exploring projects, codex, and site navigation.",
  alternates: {
    canonical: "https://stepweaver.dev/terminal",
  },
  openGraph: {
    title: "Terminal | Stephen Weaver",
    description:
      "Browser-based command interface for exploring projects, codex, and site navigation.",
    type: "website",
    url: "https://stepweaver.dev/terminal",
  },
};

export default function TerminalPage() {
  return <TerminalPageClient />;
}
