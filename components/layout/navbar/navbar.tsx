"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BrandWordmark } from "@/components/ui/brand-wordmark";

const NAV_LINKS = [
  { label: "Brief", href: "/brief" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Codex", href: "/codex" },
  { label: "Terminal", href: "/terminal" },
  { label: "Contact", href: "/contact" },
];

const SLIDE_OUT_MS = 400;

/** Animated hamburger → X (from v3 MobileNav) */
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-6 flex-col items-center justify-center" aria-hidden>
      <span
        className={`absolute h-0.5 w-5 origin-center rounded-full bg-current transition-all duration-300 ease-out ${
          open ? "rotate-45 translate-y-1.5" : "-translate-y-1.5 rotate-0"
        }`}
      />
      <span
        className={`h-0.5 w-5 origin-center rounded-full bg-current transition-all duration-300 ease-out ${
          open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
        }`}
      />
      <span
        className={`absolute h-0.5 w-5 origin-center rounded-full bg-current transition-all duration-300 ease-out ${
          open ? "-rotate-45 -translate-y-1.5" : "translate-y-1.5 rotate-0"
        }`}
      />
    </span>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileClosing, setMobileClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMobileClose = useCallback(() => {
    setMobileClosing(true);
    window.setTimeout(() => {
      setMobileOpen(false);
      setMobileClosing(false);
    }, SLIDE_OUT_MS);
  }, []);

  const handleMobileOpen = useCallback(() => {
    setMobileClosing(false);
    setMobileOpen(true);
  }, []);

  useEffect(() => {
    if (mobileOpen || mobileClosing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, mobileClosing]);

  const showMobilePortal = mounted && (mobileOpen || mobileClosing);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 ${
        scrolled
          ? "bg-[rgb(var(--panel)/0.72)] backdrop-blur-md border-b border-[rgb(var(--neon)/0.12)] shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="font-[var(--font-ocr)] text-sm tracking-wider text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors inline-flex items-center"
          >
            <BrandWordmark labelClassName="text-inherit" lambdaClassName="text-inherit" />
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
            {!mobileOpen && !mobileClosing ? (
              <>
                <ThemeToggle />
                <button
                  type="button"
                  onClick={handleMobileOpen}
                  className="flex cursor-pointer items-center justify-center rounded-sm bg-[rgb(var(--panel)/0.5)] p-3 text-neon backdrop-blur-sm transition-colors duration-200 hover:bg-[rgb(var(--panel)/0.7)] hover:text-accent touch-manipulation"
                  aria-expanded={false}
                  aria-label="Open navigation menu"
                  aria-controls="mobile-navigation-menu"
                  style={{ minHeight: 44, minWidth: 44 }}
                >
                  <HamburgerIcon open={false} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {showMobilePortal
        ? createPortal(
            <div
              className={`fixed inset-0 z-[9999] flex flex-col bg-[rgb(var(--panel)/0.98)] backdrop-blur-xl ${
                mobileClosing ? "animate-mobile-nav-out" : "animate-mobile-nav-in"
              }`}
              id="mobile-navigation-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
            >
              <div className="pointer-events-none absolute inset-0 rounded-none">
                <div className="absolute left-0 top-0 h-6 w-8 border-l-2 border-t-2 border-[rgb(var(--neon)/0.4)]" />
                <div className="absolute bottom-0 right-0 h-6 w-8 border-b-2 border-r-2 border-[rgb(var(--neon)/0.4)]" />
              </div>

              <div className="flex items-center justify-between gap-3 px-5 py-4 shrink-0 border-b border-[rgb(var(--neon)/0.1)]">
                <div className="flex items-baseline gap-2 min-w-0 text-[rgb(var(--neon))]">
                  <span className="truncate inline-flex min-w-0">
                    <BrandWordmark
                      className="text-lg font-semibold tracking-wide"
                      labelClassName="text-inherit"
                      lambdaClassName="text-inherit"
                    />
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[10px] text-[rgb(var(--neon)/0.4)] hidden sm:inline">
                    NAV-00
                  </span>
                  <button
                    type="button"
                    onClick={handleMobileClose}
                    className="flex items-center justify-center w-11 h-11 rounded-sm text-neon hover:bg-[rgb(var(--neon)/0.1)] transition-colors touch-manipulation font-sans text-4xl leading-none"
                    aria-label="Close menu"
                  >
                    »
                  </button>
                </div>
              </div>

              <nav
                className="flex-1 min-h-0 overflow-y-auto px-5 pb-6 pt-2"
                aria-label="Mobile navigation"
              >
                <ul className="font-[var(--font-ibm)] space-y-1">
                  <li>
                    <Link
                      href="/"
                      onClick={handleMobileClose}
                      className="block py-4 text-[rgb(var(--text-color))] hover:text-neon transition-colors text-base tracking-wide border-b border-[rgb(var(--white)/0.05)]"
                    >
                      HOME
                    </Link>
                  </li>
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={handleMobileClose}
                        className="block py-4 text-[rgb(var(--text-secondary))] hover:text-neon transition-colors text-base tracking-wide border-b border-[rgb(var(--white)/0.05)] last:border-b-0"
                      >
                        {link.label.toUpperCase()}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <footer className="shrink-0 px-5 py-3 border-t border-[rgb(var(--neon)/0.1)] flex items-center justify-between text-[11px] font-mono text-[rgb(var(--muted-color)/0.85)]">
                <span>stepweaver@v5.0</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--neon)/0.8)]" />
                  connected
                </span>
              </footer>
            </div>,
            document.body
          )
        : null}
    </header>
  );
}
