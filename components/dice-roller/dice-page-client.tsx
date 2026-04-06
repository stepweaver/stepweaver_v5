"use client";

import { useState } from "react";
import { Dices, History, Zap, Keyboard, Target, ChevronRight } from "lucide-react";
import { BackgroundCanvasWrapper } from "@/components/effects/background-canvas-wrapper";
import { DiceRoller } from "@/components/dice-roller/dice-roller";

const FEATURE_MODULES = [
  {
    title: "Hold & reroll",
    body: "Click dice in results to hold them, then reroll the rest. Perfect for advantage or exploding dice.",
    icon: Target,
    tag: "MOD-01",
  },
  {
    title: "Persistent history",
    body: "Every roll saved to browser storage with timestamp, notation, and notes.",
    icon: History,
    tag: "MOD-02",
  },
  {
    title: "Keyboard shortcuts",
    body: "ENTER to roll, C to copy notation, R to reset, ESC to clear.",
    icon: Keyboard,
    tag: "MOD-03",
  },
];

const KEYBOARD_GUIDE = [
  { key: "ENTER", action: "Roll current pool" },
  { key: "C", action: "Copy notation" },
  { key: "R", action: "Reset pool" },
  { key: "ESC", action: "Clear results" },
];

function SidebarPanel({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`hud-panel p-3 ${className}`}>
      {label ? (
        <p className="font-[var(--font-ocr)] text-xs tracking-[0.25em] text-[rgb(var(--neon)/0.45)] uppercase mb-2">
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}

function MobileBriefBar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="lg:hidden shrink-0 border-b border-[rgb(var(--neon)/0.15)]">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[rgb(var(--panel)/0.3)] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-[rgb(var(--neon)/0.5)]" />
          <span className="font-[var(--font-ocr)] text-xs tracking-[0.2em] text-[rgb(var(--neon)/0.5)] uppercase">
            Quick reference
          </span>
        </div>
        <ChevronRight
          className={`w-3 h-3 text-[rgb(var(--neon)/0.4)] transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        />
      </button>

      {expanded ? (
        <div className="px-3 pb-3 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-1">
            {KEYBOARD_GUIDE.map((item) => (
              <span key={item.key} className="font-[var(--font-ocr)] text-sm">
                <span className="text-[rgb(var(--neon)/0.6)] font-[var(--font-ibm)]">{item.key}</span>
                <span className="text-[rgb(var(--muted-color)/0.45)]"> - {item.action}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DicePageClient() {
  return (
    <div className="relative flex flex-col flex-1 min-h-0 h-[calc(100dvh-3.5rem)] overflow-hidden">
      <BackgroundCanvasWrapper />

      <div className="relative z-10 flex flex-col h-full min-h-0">
        <header className="shrink-0 border-b border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.6)] backdrop-blur-sm px-3 sm:px-5 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Dices className="w-3.5 h-3.5 text-[rgb(var(--neon)/0.6)]" />
            <span className="font-[var(--font-ocr)] text-xs tracking-[0.3em] text-[rgb(var(--neon)/0.5)] uppercase">
              ROLL-00
            </span>
            <span className="text-[rgb(var(--neon)/0.15)] hidden sm:inline">│</span>
            <span className="font-[var(--font-ibm)] text-xs text-[rgb(var(--muted-color)/0.85)] hidden sm:inline">
              λstepweaver dice
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[rgb(var(--neon))] opacity-40 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[rgb(var(--neon))]" />
              </span>
              <span className="font-[var(--font-ocr)] text-xs tracking-[0.15em] text-[rgb(var(--neon)/0.6)] uppercase">
                Ready
              </span>
            </span>
          </div>
        </header>

        <MobileBriefBar />

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          <aside className="hidden lg:flex lg:flex-col lg:w-72 2xl:w-80 shrink-0 border-r border-[rgb(var(--neon)/0.15)] overflow-y-auto">
            <div className="p-3 space-y-3 flex-1">
              <SidebarPanel label="SYS.BRIEF">
                <p className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))] leading-snug">RPG Dice Roller.</p>
                <p className="font-[var(--font-ocr)] text-sm text-[rgb(var(--muted-color)/0.9)] leading-relaxed mt-2">
                  Roll complex dice pools, hold dice for rerolls, and track history. Built with keyboard shortcuts for speed.
                </p>
                <div className="mt-3 w-full h-px bg-gradient-to-r from-[rgb(var(--neon)/0.3)] via-[rgb(var(--neon)/0.1)] to-transparent" />
                <p className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon)/0.4)] mt-2">
                  Fully client-side. All rolls saved to your browser.
                </p>
              </SidebarPanel>

              <SidebarPanel label="QUICK.START">
                <ul className="space-y-1.5 font-[var(--font-ocr)] text-sm text-[rgb(var(--muted-color)/0.85)]">
                  <li>1. Click dice to add to pool. Adjust with +/−.</li>
                  <li>2. Add modifiers or notes. Hit ENTER or ROLL.</li>
                  <li>3. Click dice to hold, then REROLL to keep values.</li>
                </ul>
              </SidebarPanel>

              <div>
                <p className="font-[var(--font-ocr)] text-xs tracking-[0.25em] text-[rgb(var(--neon)/0.4)] uppercase px-1 mb-2">
                  Modules
                </p>
                <div className="space-y-1.5">
                  {FEATURE_MODULES.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <div
                        key={mod.tag}
                        className="group flex items-start gap-2.5 px-3 py-2.5 rounded-sm bg-[rgb(var(--panel)/0.3)] border border-[rgb(var(--neon)/0.08)] hover:border-[rgb(var(--neon)/0.2)] hover:bg-[rgb(var(--panel)/0.5)] transition-all duration-200"
                      >
                        <Icon className="w-3.5 h-3.5 text-[rgb(var(--neon)/0.55)] mt-0.5 shrink-0 group-hover:text-[rgb(var(--neon)/0.8)] transition-colors" />
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <p className="font-[var(--font-ibm)] text-xs text-[rgb(var(--neon)/0.8)] group-hover:text-neon transition-colors">
                              {mod.title}
                            </p>
                            <span className="font-[var(--font-ocr)] text-[8px] text-[rgb(var(--neon)/0.25)]">{mod.tag}</span>
                          </div>
                          <p className="font-[var(--font-ocr)] text-sm text-[rgb(var(--muted-color)/0.6)] leading-snug mt-0.5">
                            {mod.body}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <SidebarPanel label="KEYBIND">
                <div className="space-y-1.5">
                  {KEYBOARD_GUIDE.map((item) => (
                    <div key={item.key} className="flex items-baseline gap-2 font-[var(--font-ocr)] text-xs">
                      <code className="text-[rgb(var(--neon)/0.65)] shrink-0 font-[var(--font-ibm)] text-sm px-1.5 py-0.5 rounded bg-[rgb(var(--panel)/0.5)] border border-[rgb(var(--neon)/0.15)]">
                        {item.key}
                      </code>
                      <span className="text-[rgb(var(--muted-color)/0.45)] truncate">{item.action}</span>
                    </div>
                  ))}
                </div>
              </SidebarPanel>

              <div className="px-1 space-y-1">
                <div className="flex items-center gap-2 font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.4)]">
                  <span className="w-1 h-1 rounded-full bg-[rgb(var(--neon)/0.3)]" />
                  <span>Client-side only</span>
                </div>
                <div className="flex items-center gap-2 font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.4)]">
                  <span className="w-1 h-1 rounded-full bg-[rgb(var(--neon)/0.3)]" />
                  <span>History stored in browser</span>
                </div>
              </div>
            </div>
          </aside>

          <section id="dice-roller-section" className="flex-1 min-h-0 flex flex-col">
            <div className="shrink-0 bg-[rgb(var(--panel)/0.5)] border-b border-[rgb(var(--neon)/0.2)] px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dices className="w-3 h-3 text-[rgb(var(--neon)/0.4)]" />
                <span className="font-[var(--font-ocr)] text-xs tracking-[0.18em] text-[rgb(var(--neon)/0.4)] uppercase">
                  Dice pool
                </span>
              </div>
              <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.35)] hidden sm:inline">
                ROLL-01
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 md:p-5">
              <DiceRoller />
            </div>
          </section>
        </div>

        <footer className="shrink-0 border-t border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.6)] backdrop-blur-sm px-3 sm:px-5 py-1.5 flex items-center gap-2 sm:gap-3 overflow-x-auto">
          <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon)/0.45)] whitespace-nowrap">
            <span className="font-sans">»</span> roll
          </span>
          <span className="text-[rgb(var(--neon)/0.15)]">│</span>
          <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.45)] uppercase whitespace-nowrap">
            Pool ready
          </span>
          <span className="text-[rgb(var(--neon)/0.15)] hidden sm:inline">│</span>
          <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.45)] uppercase whitespace-nowrap hidden sm:inline">
            Local storage
          </span>
          <span className="text-[rgb(var(--neon)/0.15)] hidden md:inline">│</span>
          <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.35)] uppercase whitespace-nowrap hidden md:inline">
            No server
          </span>
        </footer>
      </div>
    </div>
  );
}
