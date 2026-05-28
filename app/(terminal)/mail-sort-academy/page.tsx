import type { Metadata } from "next";
import { GameShell } from "@/components/mail-sort-academy/GameShell";

export const metadata: Metadata = {
  title: "Mail Sort Academy | stepweaver.dev",
  description:
    "Unofficial USPS Academy study game. Practice mail classes, UBBM decisions, carrier endorsements, and accountable mail handling.",
  robots: { index: false, follow: false },
};

export default function MailSortAcademyPage() {
  return <GameShell />;
}
