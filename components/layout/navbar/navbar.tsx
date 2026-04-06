"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_LINKS = [
  { label: "Brief", href: "/brief" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Codex", href: "/codex" },
  { label: "Terminal", href: "/terminal" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider hover:text-[rgb(var(--accent))] transition-colors">
            λstepweaver
          </Link>

          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-[var(--font-ibm)] text-xs uppercase tracking-wider text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--neon))] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon))] border border-[rgb(var(--border)/0.4)] px-3 py-1 hover:bg-[rgb(var(--neon)/0.1)] transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? "CLOSE" : "NAV-00"}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[rgb(var(--bg)/0.95)] backdrop-blur-sm">
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider">NAV-00</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="font-[var(--font-ocr)] text-xs text-[rgb(var(--red))] border border-[rgb(var(--red)/0.4)] px-3 py-1"
              >
                CLOSE
              </button>
            </div>
            <nav className="flex flex-col gap-4 flex-1" aria-label="Mobile navigation">
              <Link href="/" onClick={() => setMobileOpen(false)} className="font-[var(--font-ibm)] text-lg uppercase tracking-wider text-[rgb(var(--text-color))] hover:text-[rgb(var(--neon))] transition-colors">
                HOME
              </Link>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-[var(--font-ibm)] text-lg uppercase tracking-wider text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--neon))] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color))]">
              v5.0.0 — connected
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
