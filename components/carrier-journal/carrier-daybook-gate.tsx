"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function CarrierDaybookGate() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-[10px] tracking-widest">
            CARRIER DAYBOOK // PRIVATE
          </div>
          <h1 className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))]">
            Identify yourself.
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
            This terminal requires authorization. Enter the passphrase to continue.
          </p>
        </div>

        <form method="GET" action="/log" className="space-y-4">
          <div>
            <label
              htmlFor="daybook-token"
              className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] block mb-2"
            >
              PASSPHRASE
            </label>
            <div className="relative">
              <input
                id="daybook-token"
                name="token"
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                required
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
          <button
            type="submit"
            className="glitch-button glitch-button--primary w-full"
          >
            Enter
          </button>
        </form>

        <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta)/0.4)] text-center">
          ACCESS RESTRICTED // POSTAL SECURITY DIVISION
        </div>
      </div>
    </div>
  );
}
