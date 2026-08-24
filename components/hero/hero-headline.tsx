"use client";

export function HeroHeadline() {
  return (
    <div>
      <h1 className="font-[var(--font-ibm)] text-4xl sm:text-5xl lg:text-6xl text-[rgb(var(--text-color))] leading-tight">
        Product-minded systems
        <br />
        <span className="text-[rgb(var(--neon))]">for operations-heavy teams</span>
      </h1>
      <p className="mt-4 max-w-2xl text-[rgb(var(--text-secondary))] text-sm sm:text-base leading-relaxed font-[var(--font-ibm)]">
        I design and ship internal tools, workflow automations, and AI-assisted systems that turn messy business processes into dependable software.
      </p>
      <p className="mt-3 max-w-2xl text-[rgb(var(--text-meta))] text-xs sm:text-sm font-[var(--font-ibm)]">
        Business Systems Developer · Full-stack development · internal tools · automation · operational software
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/work" className="glitch-button glitch-button--primary">
          View Work
        </a>
        <a href="/resume" className="glitch-button">
          Resume
        </a>
        <a href="/contact?intent=hire" className="glitch-button">
          Contact
        </a>
      </div>
    </div>
  );
}
