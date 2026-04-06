"use client";

import { useState, useCallback } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, _hp_website: "", _t: Date.now(), _d: 2000 }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to send message");
    }
  }, [name, email, message]);

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
          <button
            onClick={() => setStatus("idle")}
            className="glitch-button glitch-button--primary"
          >
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
            Get in Touch
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm max-w-xl">
            Have a project in mind or want to discuss how I can help? Fill out the form below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="surface-panel p-6 sm:p-8 space-y-6">
          <div>
            <label htmlFor="name" className="text-label block mb-2">Name</label>
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
            <label htmlFor="email" className="text-label block mb-2">Email</label>
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
            <label htmlFor="message" className="text-label block mb-2">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-sm px-3 py-2 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors resize-none"
              placeholder="Tell me about your project..."
            />
          </div>

          {errorMsg && (
            <div className="text-[rgb(var(--red))] text-sm">{errorMsg}</div>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="glitch-button glitch-button--primary w-full sm:w-auto"
          >
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
