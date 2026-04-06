import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Theme Audit",
  description: "Preview all themes.",
};

export default function ThemeAuditLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
