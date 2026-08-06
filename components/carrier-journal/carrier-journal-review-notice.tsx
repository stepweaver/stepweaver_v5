import Link from "next/link";

/** Public containment surface while the field journal is under ethics/privacy review. */
export function CarrierJournalReviewNotice() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
          FIELD JOURNAL // UNDER REVIEW
        </div>
        <h1 className="font-[var(--font-ibm)] text-3xl sm:text-5xl text-[rgb(var(--text-color))] mb-6">
          Journal under review
        </h1>
        <div className="space-y-4 text-[rgb(var(--text-secondary))] text-sm sm:text-base leading-relaxed border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--bg))] p-6 sm:p-8">
          <p>
            This section is temporarily unavailable while its content and publication
            controls are reviewed for privacy, workplace ethics, and operational
            confidentiality.
          </p>
          <p>
            Customer, coworker, route, workplace, and product-testing information is not
            accepted for publication.
          </p>
          <p>
            Correction or takedown requests may be submitted through the site&apos;s{" "}
            <Link
              href="/contact"
              className="text-[rgb(var(--neon))] underline underline-offset-2 hover:text-[rgb(var(--cyan))]"
            >
              contact
            </Link>{" "}
            or{" "}
            <Link
              href="/privacy"
              className="text-[rgb(var(--neon))] underline underline-offset-2 hover:text-[rgb(var(--cyan))]"
            >
              privacy
            </Link>{" "}
            channel.
          </p>
        </div>
      </div>
    </div>
  );
}
