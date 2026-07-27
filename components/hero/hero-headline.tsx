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
      <p className="mt-4 text-xs text-[rgb(var(--text-meta))] font-[var(--font-ocr)] tracking-wide">
        Selective consulting:{" "}
        <a href="/services" className="text-[rgb(var(--neon)/0.8)] hover:text-[rgb(var(--neon))] underline underline-offset-2">
          custom workflows when the fit is right
        </a>
      </p>
    </div>
  );
}
