"use client";

import { useEffect, useState, useCallback } from "react";

const FALLBACK_SCRIPT =
  "https://script.google.com/macros/s/AKfycbyjvVhJ9UzjPHErwZ7tju4rSzBj7zeegW6HAnBdGNAafiUuWPFKDUysD3jnUFBtMZdQ3A/exec";

export default function BookShowerPage() {
  const [queryString, setQueryString] = useState("");
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [closedMessage, setClosedMessage] = useState("Bookings are currently closed.");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getGoogleScriptUrl = useCallback(() => {
    const base = process.env.NEXT_PUBLIC_BOOK_SHOWER_SCRIPT_URL || FALLBACK_SCRIPT;
    if (queryString) {
      const cleanQuery = queryString.startsWith("?") ? queryString.slice(1) : queryString;
      return `${base}?${cleanQuery}`;
    }
    return base;
  }, [queryString]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setQueryString(window.location.search);
    }
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/book-shower?action=config");
        if (!response.ok) {
          throw new Error("Failed to fetch config");
        }
        const data = (await response.json()) as Record<string, unknown>;

        let enabled = true;
        let message = "Bookings are currently closed.";

        if (data.booking_enabled !== undefined) {
          enabled =
            data.booking_enabled === true ||
            data.booking_enabled === "true" ||
            data.booking_enabled === 1 ||
            data.booking_enabled === "1";
          message = (data.booking_closed_message as string) || message;
        } else if (data.config && typeof data.config === "object") {
          const config = data.config as Record<string, unknown>;
          enabled =
            config.booking_enabled === true ||
            config.booking_enabled === "true" ||
            config.booking_enabled === 1 ||
            config.booking_enabled === "1";
          message = (config.booking_closed_message as string) || message;
        }

        setBookingEnabled(enabled);
        setClosedMessage(message);
      } catch (err) {
        console.error("Error fetching booking config:", err);
        setError(err instanceof Error ? err.message : "Error");
        setBookingEnabled(true);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[rgb(var(--bg))] z-[9999]">
        <div className="text-center">
          <p className="text-[rgb(var(--neon)/0.5)] font-[var(--font-ocr)] text-xs tracking-[0.2em] uppercase">
            SCANNING MODULES...
          </p>
        </div>
      </div>
    );
  }

  if (error && !bookingEnabled) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[rgb(var(--bg))] z-[9999]">
        <div className="text-center max-w-md mx-auto p-8 border border-[rgb(var(--neon)/0.3)] rounded-lg bg-[rgb(var(--border)/0.3)]">
          <p className="text-[rgb(var(--neon))] font-[var(--font-ocr)] text-base">
            [ERROR] Error loading booking system: {error}
          </p>
        </div>
      </div>
    );
  }

  if (!bookingEnabled) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[rgb(var(--bg))] z-[9999]">
        <div className="text-center max-w-md mx-auto p-8 border border-[rgb(var(--neon)/0.3)] rounded-lg bg-[rgb(var(--border)/0.3)]">
          <p className="text-[rgb(var(--neon))] font-[var(--font-ocr)] text-lg whitespace-pre-line">{closedMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full z-[9999]">
      <iframe
        src={getGoogleScriptUrl()}
        width="100%"
        height="100%"
        title="Book Shower"
        className="w-full h-full border-0"
        allow="fullscreen"
      />
    </div>
  );
}
