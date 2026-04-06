import Link from "next/link";

/** Bio block from Brief / Background (BIO-01); shared with the home hero. */
export function BackgroundBio() {
  return (
    <>
      <h2 className="font-[var(--font-ibm)] text-[rgb(var(--text-color))] text-xl md:text-2xl leading-tight mb-5">
        I translate business workflows into working systems.
      </h2>

      <div className="space-y-4 text-[rgb(var(--text-secondary))] text-sm md:text-base leading-relaxed font-[var(--font-ibm)]">
        <p>
          I&apos;m Stephen Weaver. I came into software through operations, analysis, and real-world process work:
          Airborne Cryptologic Linguist in the U.S. Air Force, then restaurant operations and business analysis, then
          development. That path still shapes how I build.
        </p>
        <p className="text-[rgb(var(--text-color))] text-xs uppercase tracking-wider font-[var(--font-ocr)]">
          Trajectory
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>U.S. Air Force veteran; Airborne Cryptologic Linguist</li>
          <li>Restaurant operations and management</li>
          <li>Business analysis</li>
          <li>Self-taught developer</li>
          <li>Current focus: DevOps and infrastructure</li>
        </ul>
        <p>
          I don&apos;t treat software as an isolated code problem. I look at the workflow, the handoffs, the data, the
          integrations, and the risks. Then I build systems people can use, maintain, and trust.
        </p>
      </div>

      <footer className="mt-8 pt-6 border-t border-[rgb(var(--border)/0.2)] space-y-2">
        <p className="font-[var(--font-ibm)] text-[rgb(var(--accent))] text-base md:text-lg">
          Curious about my work or want to chat?
        </p>
        <p className="text-sm md:text-base font-[var(--font-ibm)] text-[rgb(var(--text-color))] leading-relaxed">
          Check out my{" "}
          <Link
            href="/resume"
            className="text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors underline hover:no-underline font-semibold"
          >
            resume
          </Link>{" "}
          or{" "}
          <Link
            href="/contact"
            className="text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors underline hover:no-underline font-semibold"
          >
            send me a message
          </Link>
          .
        </p>
      </footer>
    </>
  );
}
