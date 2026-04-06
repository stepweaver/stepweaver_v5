import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dice Roller",
  description: "RPG dice pool builder.",
};

export default function DiceRollerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
