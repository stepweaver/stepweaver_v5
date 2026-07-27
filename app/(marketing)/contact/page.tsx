"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

function intentCopy(intent: string | null): { title: string; blurb: string; placeholder: string } {
  if (intent === "consult") {
    return {
      title: "Consulting inquiry",
      blurb:
        "Tell me about the workflow, data movement, or ops problem. Selective fit: if we vibe and the need is real, we can talk scope.",
      placeholder: "What's broken, who feels it, and what a good outcome looks like...",
    };
  }
  if (intent === "hire" || intent === "brief") {
    return {
      title: "Hiring conversation",
      blurb: "Open to roles where operations, internal tools, and practical AI meet. Share the team, stack, and what you need built.",
      placeholder: "Role, team context, and why this might be a fit...",
    };
  }
  return {
    title: "Get in Touch",
    blurb: "Hiring is the primary path. Selective consulting for custom data workflows when the fit is right. Say which lane you're in.",
    placeholder: "Tell me what you're looking for...",
  };
}

function ContactForm() {
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent");
  const copy = intentCopy(intent);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(!TURNSTILE_SITE_KEY);
  const pageOpenedAt = useRef<number | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const turnstileToken = useRef<string | null>(null);

  useEffect(() => {
    pageOpenedAt.current = Date.now();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus("sending");
      setErrorMsg("");
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            message: intent ? `[intent:${intent}]\n\n${message}` : message,
            _hp_website: "",
            _t: pageOpenedAt.current ?? Date.now(),
            _d: Math.max(0, Date.now() - (pageOpenedAt.current ?? Date.now())),
            ...(turnstileToken.current ? { cf_turnstile_response: turnstileToken.current } : {}),
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to send");
        }
        setStatus("sent");
        setName("");
        setEmail("");
        setMessage("");
        turnstileRef.current?.reset();
        turnstileToken.current = null;
        setTurnstileReady(false);
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Failed to send message");
        turnstileRef.current?.reset();
        turnstileToken.current = null;
        setTurnstileReady(false);
      }
    },
    [name, email, message, intent]
  );

  if (status === "sent") {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="surface-panel p-8 max-w-md text-center">
          <div className="text-[rgb(var(--neon))] font-[var(--font-ocr)] text-sm tracking-wider mb-4">
            MESSAGE SENT
          </div>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-6">
            Thank you for reaching out. I will get back to you shortly.
          </p>
          <button onClick={() => setStatus("idle")} className="glitch-button glitch-button--primary">
            Send Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
            {"// CONTACT"}
          </div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))] mb-4">
            {copy.title}
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm max-w-xl">{copy.blurb}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-[var(--font-ocr)] tracking-wide">
            <a
              href="/contact?intent=hire"
              className={`px-2 py-1 border transition-colors ${
                intent === "hire" || intent === "brief"
                  ? "border-[rgb(var(--neon))] text-[rgb(var(--neon))]"
                  : "border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-meta))] hover:border-[rgb(var(--neon)/0.5)]"
              }`}
            >
              HIRE
            </a>
            <a
              href="/contact?intent=consult"
              className={`px-2 py-1 border transition-colors ${
                intent === "consult"
                  ? "border-[rgb(var(--neon))] text-[rgb(var(--neon))]"
                  : "border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-meta))] hover:border-[rgb(var(--neon)/0.5)]"
              }`}
            >
              CONSULT
            </a>
            <a
              href="/contact"
              className={`px-2 py-1 border transition-colors ${
                !intent
                  ? "border-[rgb(var(--neon))] text-[rgb(var(--neon))]"
                  : "border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-meta))] hover:border-[rgb(var(--neon)/0.5)]"
              }`}
            >
              GENERAL
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="surface-panel p-6 sm:p-8 space-y-6">
          <div>
            <label htmlFor="name" className="text-label block mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-sm px-3 py-2 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-label block mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-sm px-3 py-2 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="text-label block mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-sm px-3 py-2 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors resize-none"
              placeholder={copy.placeholder}
            />
          </div>

          {errorMsg && <div className="text-[rgb(var(--red))] text-sm">{errorMsg}</div>}

          {TURNSTILE_SITE_KEY && (
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              options={{ size: "invisible" }}
              onSuccess={(token) => {
                turnstileToken.current = token;
                setTurnstileReady(true);
              }}
              onExpire={() => {
                turnstileToken.current = null;
                setTurnstileReady(false);
              }}
              onError={() => {
                turnstileToken.current = null;
                setTurnstileReady(false);
              }}
            />
          )}

          <button
            type="submit"
            disabled={status === "sending" || !turnstileReady}
            className="glitch-button glitch-button--primary w-full sm:w-auto"
          >
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20" />}>
      <ContactForm />
    </Suspense>
  );
}
