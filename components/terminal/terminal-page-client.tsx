"use client";

import {
  Command,
  BookOpen,
  Sparkles,
  Terminal as TerminalIcon,
  ChevronRight,
  Map,
} from "lucide-react";
import { useState } from "react";
import { Terminal } from "@/components/terminal/terminal";
import { BackgroundCanvasWrapper } from "@/components/effects/background-canvas-wrapper";

const FEATURE_MODULES = [
  {
    title: "Resume",
    cmd: "resume",
    body: "Experience, education, skills. Or download the PDF.",
    icon: BookOpen,
    tag: "MOD-01",
  },
  {
    title: "LLM Chat",
    cmd: "chat <msg>",
    body: "Discuss my background with λlambda, a portfolio-native AI trained on my experience.",
    icon: Sparkles,
    tag: "MOD-02",
  },
  {
    title: "Codex",
    cmd: "codex",
    body: "Browse blog posts, projects, and community contributions.",
    icon: Map,
    tag: "MOD-03",
  },
];

const COMMAND_GUIDE = [
  { command: "help", summary: "Show commands" },
  { command: "resume", summary: "View experience" },
  { command: "chat <msg>", summary: "Talk to λlambda" },
  { command: "codex", summary: "Browse content" },
  { command: "weather <city>", summary: "Check weather" },
  { command: "roll <notation>", summary: "Roll RPG dice" },
  { command: "cd <dest>", summary: "Jump to sections/pages" },
  { command: "zork", summary: "Text adventure" },
  { command: "blackjack", summary: "Play Blackjack" },
  { command: "contact", summary: "Send message" },
  { command: "clear", summary: "Clear screen" },
];

function SidebarPanel({ children, label, className = "" }: { children: React.ReactNode; label?: string; className?: string }) {
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
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[rgb(var(--panel)/0.3)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Command className="w-3 h-3 text-[rgb(var(--neon)/0.5)]" />
          <span className="font-[var(--font-ocr)] text-xs tracking-[0.2em] text-[rgb(var(--neon)/0.5)] uppercase">
            System modules
          </span>
        </div>
        <ChevronRight
          className={`w-3 h-3 text-[rgb(var(--neon)/0.4)] transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        />
      </button>

      {expanded ? (
        <div className="px-3 pb-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {COMMAND_GUIDE.map((item) => (
              <div key={item.command} className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon)/0.5)]">
                <span className="text-[rgb(var(--neon)/0.7)]">{item.command}</span>
                <span className="text-[rgb(var(--muted-color)/0.7)]"> - {item.summary}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function TerminalPageClient() {
  return (
    <div className="relative flex flex-col flex-1 min-h-0 h-[calc(100dvh-3.5rem)] overflow-hidden">
      <BackgroundCanvasWrapper />

      <div className="relative z-10 flex flex-col h-full min-h-0">
        <header className="shrink-0 border-b border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.6)] backdrop-blur-sm px-3 sm:px-5 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <TerminalIcon className="w-3.5 h-3.5 text-[rgb(var(--neon)/0.6)]" />
            <span className="font-[var(--font-ocr)] text-xs tracking-[0.3em] text-[rgb(var(--neon)/0.5)] uppercase">
              TERM-00
            </span>
            <span className="text-[rgb(var(--neon)/0.15)] hidden sm:inline">│</span>
            <span className="font-[var(--font-ibm)] text-xs text-[rgb(var(--muted-color)/0.85)] hidden sm:inline">
              λstepweaver terminal
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon)/0.35)] hidden sm:inline">
              v5.0.0
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[rgb(var(--neon))] opacity-40 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[rgb(var(--neon))]" />
              </span>
              <span className="font-[var(--font-ocr)] text-xs tracking-[0.15em] text-[rgb(var(--neon)/0.6)] uppercase">
                Active
              </span>
            </span>
          </div>
        </header>

        <MobileBriefBar />

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          <aside className="hidden lg:flex lg:flex-col lg:w-72 2xl:w-80 shrink-0 border-r border-[rgb(var(--neon)/0.15)] overflow-y-auto">
            <div className="p-3 space-y-3 flex-1">
              <SidebarPanel label="SYS.BRIEF">
                <p className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))] leading-snug">
                  Interactive terminal.
                </p>
                <p className="font-[var(--font-ocr)] text-sm text-[rgb(var(--muted-color)/0.9)] leading-relaxed mt-2">
                  A command-line interface to explore this site. Browse content, chat with an AI, and more.
                </p>
                <div className="mt-3 w-full h-px bg-gradient-to-r from-[rgb(var(--neon)/0.3)] via-[rgb(var(--neon)/0.1)] to-transparent" />
                <p className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon)/0.4)] mt-2">
                  Type <span className="text-[rgb(var(--neon)/0.65)]">help</span> to get started.
                </p>
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
                            <span className="font-[var(--font-ocr)] text-[8px] text-[rgb(var(--neon)/0.25)]">
                              {mod.tag}
                            </span>
                          </div>
                          <p className="font-[var(--font-ocr)] text-sm text-[rgb(var(--muted-color)/0.75)] leading-snug mt-0.5">
                            {mod.body}
                          </p>
                          <p className="font-mono text-xs text-[rgb(var(--accent)/0.45)] mt-1">
                            &gt; {mod.cmd}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <SidebarPanel label="CMD.REF">
                <div className="space-y-1.5">
                  {COMMAND_GUIDE.map((item) => (
                    <div key={item.command} className="flex items-baseline gap-2 font-[var(--font-ocr)] text-xs">
                      <code className="text-[rgb(var(--neon)/0.65)] shrink-0 font-[var(--font-ibm)] text-sm">
                        {item.command}
                      </code>
                      <span className="text-[rgb(var(--muted-color)/0.5)] truncate">{item.summary}</span>
                    </div>
                  ))}
                </div>
              </SidebarPanel>

              <div className="px-1 space-y-1">
                <div className="flex items-center gap-2 font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.45)]">
                  <span className="w-1 h-1 rounded-full bg-[rgb(var(--neon)/0.3)]" />
                  <span>Browser-first interface · Some commands call live services</span>
                </div>
                <div className="flex items-center gap-2 font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.45)]">
                  <span className="w-1 h-1 rounded-full bg-[rgb(var(--neon)/0.3)]" />
                  <span>Chat, contact, and weather use live APIs</span>
                </div>
              </div>
            </div>
          </aside>

          <section
            id="terminal-section"
            className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden"
          >
            <div className="shrink-0 bg-[rgb(var(--panel)/0.5)] border-b border-[rgb(var(--neon)/0.2)] px-4 py-2 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/70 border border-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/70 border border-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27ca3f]/70 border border-white/10" />
              </div>
              <span className="font-[var(--font-ocr)] text-xs tracking-[0.18em] text-[rgb(var(--neon)/0.4)] uppercase">
                ~/terminal
              </span>
              <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.35)] hidden sm:inline">
                user@stepweaver.dev
              </span>
            </div>

            <div className="flex-1 min-h-0 p-2 sm:p-3 flex flex-col">
              <Terminal embedded />
            </div>
          </section>
        </div>

        <footer className="shrink-0 border-t border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.6)] backdrop-blur-sm px-3 sm:px-5 py-1.5 flex items-center gap-2 sm:gap-3 overflow-x-auto">
          <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon)/0.45)] whitespace-nowrap">
            &gt; help
          </span>
          <span className="text-[rgb(var(--neon)/0.15)]">│</span>
          <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.45)] uppercase whitespace-nowrap">
            Session active
          </span>
          <span className="text-[rgb(var(--neon)/0.15)] hidden sm:inline">│</span>
          <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.45)] uppercase whitespace-nowrap hidden sm:inline">
            Browser-first interface
          </span>
          <span className="text-[rgb(var(--neon)/0.15)] hidden md:inline">│</span>
          <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color)/0.35)] uppercase whitespace-nowrap hidden md:inline">
            Some commands call live services
          </span>
        </footer>
      </div>
    </div>
  );
}
