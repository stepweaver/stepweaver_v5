"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { TerminalLine, TerminalMode, ContactState } from "./types";
import { processCommand } from "./commands";
import { handleResumeCommand } from "@/lib/terminal/resume-content";
import { handleCodexCommand, resetCodexSession } from "@/lib/terminal/codex-terminal";
import { handleBlackjackInput, isBlackjackActive } from "@/lib/terminal/blackjack-engine";
import { handleCaveInput, isCaveActive } from "@/lib/terminal/cave-adventure";

let lineCounter = 0;
function makeId(): string {
  return "line-" + ++lineCounter;
}

const BANNER: Omit<TerminalLine, "id">[] = [
  { content: "stepweaver.dev terminal v5.0.0", variant: "success" },
  { content: 'Type "help" for available commands.', variant: "dimmed" },
  { content: "", variant: "default" },
];

export function Terminal() {
  const router = useRouter();
  const [lines, setLines] = useState<TerminalLine[]>(() =>
    BANNER.map((l) => ({ ...l, id: makeId() }))
  );
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<TerminalMode>("normal");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [contact, setContact] = useState<ContactState>({
    isActive: false,
    step: 0,
    data: { name: "", email: "", message: "" },
    timestamp: null,
  });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const addLines = useCallback((newLines: Omit<TerminalLine, "id">[]) => {
    setLines((prev) => [...prev, ...newLines.map((l) => ({ ...l, id: makeId() }))]);
  }, []);

  const resetScreen = useCallback((keepMode?: TerminalMode) => {
    const m = keepMode ?? "normal";
    const extra =
      m !== "normal"
        ? ([{ content: "[" + m + " mode]", variant: "dimmed" as const }, { content: "", variant: "default" as const }] as const)
        : [];
    setLines([...BANNER.map((l) => ({ ...l, id: makeId() })), ...extra.map((l) => ({ ...l, id: makeId() }))]);
  }, []);

  const handleContactInput = useCallback(
    async (value: string) => {
      const trimmed = value.trim().toLowerCase();
      if (trimmed === "cancel" || trimmed === "escape") {
        setContact({ isActive: false, step: 0, data: { name: "", email: "", message: "" }, timestamp: null });
        addLines([{ content: "Contact form cancelled.", variant: "dimmed" }]);
        setMode("normal");
        return;
      }
      if (contact.step === 0) {
        setContact((c) => ({ ...c, data: { ...c.data, name: value }, step: 1 }));
        addLines([{ content: "Step 2/4: What is your email?", variant: "default" }]);
      } else if (contact.step === 1) {
        setContact((c) => ({ ...c, data: { ...c.data, email: value }, step: 2 }));
        addLines([{ content: "Step 3/4: Your message:", variant: "default" }]);
      } else if (contact.step === 2) {
        setContact((c) => ({ ...c, data: { ...c.data, message: value }, step: 3 }));
        addLines([
          { content: 'Step 4/4: Type "send" to submit, "cancel" to abort, or "edit" to review.', variant: "default" },
        ]);
      } else if (contact.step === 3) {
        if (trimmed === "send") {
          const payload = {
            name: contact.data.name,
            email: contact.data.email,
            message: contact.data.message,
            _hp_website: "",
            _t: Date.now(),
            _d: 2000,
          };
          try {
            const res = await fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error((data as { error?: string }).error || "Request failed");
            }
            addLines([{ content: "Message sent. Thank you!", variant: "success" }]);
          } catch (e) {
            addLines([
              {
                content: "Send failed: " + (e instanceof Error ? e.message : "unknown error"),
                variant: "error",
              },
            ]);
          }
          setContact({ isActive: false, step: 0, data: { name: "", email: "", message: "" }, timestamp: null });
          setMode("normal");
        } else if (trimmed === "edit") {
          addLines([
            { content: "Name: " + contact.data.name, variant: "dimmed" },
            { content: "Email: " + contact.data.email, variant: "dimmed" },
            { content: "Message: " + contact.data.message, variant: "dimmed" },
          ]);
        } else {
          addLines([{ content: 'Type "send", "cancel", or "edit".', variant: "warning" }]);
        }
      }
    },
    [contact, addLines]
  );

  const handleCommand = useCallback(
    async (rawInput: string) => {
      const trimmed = rawInput.trim().toLowerCase();

      if (contact.isActive) {
        addLines([{ content: "guest@stepweaver:~$ " + rawInput, variant: "prompt" }]);
        await handleContactInput(rawInput);
        return;
      }

      addLines([{ content: "guest@stepweaver:~$ " + rawInput, variant: "prompt" }]);

      if (rawInput.trim()) {
        setHistory((prev) => [...prev, rawInput]);
        setHistoryIndex(-1);
      }

      if (trimmed === "clear") {
        if (mode === "normal") {
          setLines(BANNER.map((l) => ({ ...l, id: makeId() })));
        } else {
          resetScreen(mode);
        }
        return;
      }

      if (mode === "resume") {
        const r = handleResumeCommand(rawInput);
        if (r.lines.length) addLines(r.lines);
        if (r.exit) setMode("normal");
        return;
      }

      if (mode === "codex") {
        const r = await handleCodexCommand(rawInput);
        if (r.clear) {
          resetScreen("codex");
          return;
        }
        if (r.lines.length) addLines(r.lines);
        if (r.exit) setMode("normal");
        return;
      }

      if (mode === "blackjack" || isBlackjackActive()) {
        const r = handleBlackjackInput(rawInput);
        if (r.lines.length) addLines(r.lines);
        if (r.exit) setMode("normal");
        return;
      }

      if (mode === "zork" || isCaveActive()) {
        const r = handleCaveInput(rawInput);
        if (r.lines.length) addLines(r.lines);
        if (r.exit) setMode("normal");
        return;
      }

      try {
        const result = await processCommand(rawInput, {
          setLines,
          addLines,
          setMode,
          navigate: (p) => router.push(p),
        });
        if (result.mode === "contact") {
          setContact({
            isActive: true,
            step: 0,
            data: { name: "", email: "", message: "" },
            timestamp: Date.now(),
          });
        }
        if (result.mode) setMode(result.mode);
        if (result.lines.length > 0) addLines(result.lines);
      } catch (err) {
        addLines([{ content: "Error: " + (err instanceof Error ? err.message : "Unknown error"), variant: "error" }]);
      }
    },
    [contact.isActive, addLines, mode, resetScreen, handleContactInput, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (contact.isActive) {
          setContact({ isActive: false, step: 0, data: { name: "", email: "", message: "" }, timestamp: null });
          addLines([{ content: "Contact form cancelled.", variant: "dimmed" }]);
          setMode("normal");
        } else if (mode !== "normal") {
          if (mode === "codex") resetCodexSession();
          setMode("normal");
          addLines([{ content: "Returned to normal shell.", variant: "dimmed" }]);
        }
        setInput("");
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length > 0 && historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setInput(history[history.length - 1 - newIndex]);
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInput(history[history.length - 1 - newIndex]);
        } else {
          setHistoryIndex(-1);
          setInput("");
        }
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        void handleCommand(input);
        setInput("");
      }
    },
    [input, history, historyIndex, contact.isActive, mode, handleCommand, addLines]
  );

  const promptText =
    contact.isActive ? "[contact]" : mode === "normal" ? "guest@stepweaver:~$" : "[" + mode + "]";

  return (
    <div className="min-h-screen pt-14 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="terminal-window">
          <div className="terminal-header">
            <span className="text-xs text-[rgb(var(--muted-color))] font-[var(--font-ocr)]">stepweaver-terminal</span>
            <span className="ml-auto text-xs text-[rgb(var(--neon))] font-[var(--font-ocr)]">{promptText}</span>
          </div>
          <div className="terminal-body" onClick={() => inputRef.current?.focus()}>
            {lines.map((line) => (
              <TerminalOutputLine key={line.id} line={line} />
            ))}
            <div className="flex items-center">
              <span className="text-[rgb(var(--green))] font-[var(--font-ibm)] text-sm whitespace-pre mr-1">
                {promptText}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-sm caret-[rgb(var(--neon))]"
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
            </div>
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalOutputLine({ line }: { line: TerminalLine }) {
  const variantClasses: Record<string, string> = {
    default: "text-[rgb(var(--text-color))]",
    prompt: "text-[rgb(var(--green))]",
    lambda: "text-[rgb(var(--neon))] font-[var(--font-ibm)]",
    success: "text-[rgb(var(--neon))]",
    error: "text-[rgb(var(--red))]",
    warning: "text-[rgb(var(--warn))]",
    dimmed: "text-[rgb(var(--muted-color))]",
    html: "text-[rgb(var(--text-color))]",
    selection: "text-[rgb(var(--accent))]",
  };
  return (
    <pre
      className={`text-sm font-[var(--font-ibm)] whitespace-pre-wrap ${variantClasses[line.variant] || variantClasses.default}`}
    >
      {line.content}
    </pre>
  );
}
