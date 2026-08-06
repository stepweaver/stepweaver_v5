"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  /** Optional path to land on after successful login (defaults to current /log). */
  redirectTo?: string;
};

export function CarrierDaybookGate({ redirectTo = "/log" }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const res = await fetch("/api/carrier-journal/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ passphrase }),
      });

      if (!res.ok) {
        setError("Unable to sign in with those credentials.");
        setPending(false);
        return;
      }

      setPassphrase("");
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("Unable to sign in with those credentials.");
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-[10px] tracking-widest">
            FIELD DAYBOOK // PRIVATE
          </div>
          <h1 className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))]">
            Identify yourself.
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
            This terminal requires authorization. Enter the passphrase to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="daybook-passphrase"
              className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2"
            >
              PASSPHRASE
            </label>
            <div className="relative">
              <input
                id="daybook-passphrase"
                name="passphrase"
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                required
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full bg-[rgb(var(--window))] border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-base px-4 py-3 pr-12 focus:border-[rgb(var(--neon))] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide passphrase" : "Show passphrase"}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-[rgb(var(--text-meta))] hover:text-[rgb(var(--neon))] transition-colors"
              >
                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error ? (
            <p className="text-sm text-[rgb(var(--magenta))]" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="glitch-button glitch-button--primary w-full disabled:opacity-60"
          >
            {pending ? "Checking…" : "Enter"}
          </button>
        </form>

        <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta)/0.4)] text-center">
          ACCESS RESTRICTED // SESSION COOKIE AUTH
        </div>
      </div>
    </div>
  );
}
