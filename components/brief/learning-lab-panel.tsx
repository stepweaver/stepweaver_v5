import Link from "next/link";
import { LEARNING_LAB } from "@/lib/data/identity";

export function LearningLabPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div
      id="learning-lab"
      className="border border-[rgb(var(--neon)/0.28)] p-4 sm:p-5 bg-[rgb(var(--panel)/0.18)]"
    >
      <div className="text-label mb-2">{LEARNING_LAB.eyebrow}</div>
      <h2 className="font-[var(--font-ibm)] text-[rgb(var(--text-color))] text-base sm:text-lg leading-snug mb-2">
        {LEARNING_LAB.title}
      </h2>
      <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed mb-3">{LEARNING_LAB.body}</p>
      {!compact ? (
        <Link href={LEARNING_LAB.href} className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))]">
          Open the lab notes →
        </Link>
      ) : (
        <Link href={LEARNING_LAB.href} className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))]">
          Lab notes →
        </Link>
      )}
    </div>
  );
}
