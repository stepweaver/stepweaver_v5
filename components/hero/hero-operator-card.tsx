export function HeroOperatorCard() {
  return (
    <div className="surface-panel p-6 relative">
      <div className="text-label mb-3">OPERATOR</div>
      <div className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] mb-4">
        stephen
      </div>
      <div className="space-y-2 text-sm text-[rgb(var(--text-secondary))]">
        <div>
          <span className="text-[rgb(var(--text-label))]">role: </span>
          technical operator
        </div>
        <div>
          <span className="text-[rgb(var(--text-label))]">focus: </span>
          architecture, automation, interfaces
        </div>
        <div>
          <span className="text-[rgb(var(--text-label))]">status: </span>
          <span className="text-[rgb(var(--neon))]">available</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[rgb(var(--border)/0.2)]">
        <div className="text-label mb-2">STACK</div>
        <div className="flex flex-wrap gap-2">
          {["Next.js", "React", "TypeScript", "Node", "Python", "AI/ML"].map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-secondary))]"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
