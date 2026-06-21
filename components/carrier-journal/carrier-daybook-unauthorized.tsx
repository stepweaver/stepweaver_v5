import Link from "next/link";

export function CarrierDaybookUnauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="border border-[rgb(var(--red)/0.4)] bg-[rgb(var(--red)/0.04)] p-6 sm:p-8 space-y-4">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--red))] text-sm tracking-widest">
            403 // YOU SHALL NOT PASS
          </div>
          <div className="space-y-3 font-[var(--font-ibm)] text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
            <p>Nice try, route goblin.</p>
            <p>
              This carrier log is protected by ancient postal magic, server-side validation,
              and one extremely tired mailman.
            </p>
            <p>
              No token. No entry. No DPS glory.
            </p>
          </div>
          <div className="border-t border-[rgb(var(--border)/0.2)] pt-4">
            <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))] space-y-1">
              <div>INCIDENT LOGGED: {new Date().toISOString()}</div>
              <div>THREAT LEVEL: ABSOLUTELY NOT</div>
              <div>STATUS: REJECTED</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/log" className="glitch-button">
            Try Again
          </Link>
          <Link href="/carrier-journal" className="glitch-button">
            Back to Carrier&apos;s Log
          </Link>
        </div>
      </div>
    </div>
  );
}
