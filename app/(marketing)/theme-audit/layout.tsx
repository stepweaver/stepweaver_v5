import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appearance",
  description: "Preview novelty palettes. Light and dark follow the system unless you override them in the header.",
};

export default function ThemeAuditLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
