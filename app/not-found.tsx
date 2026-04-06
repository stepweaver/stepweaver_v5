import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))] text-[rgb(var(--text-color))] font-mono p-8">
      <div className="max-w-md w-full text-center">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--red))] text-6xl mb-4">
          404
        </div>
        <div className="font-[var(--font-ocr)] text-[rgb(var(--yellow))] text-sm tracking-wider uppercase mb-6">
          Signal Lost — Route Not Found
        </div>
        <p className="text-[rgb(var(--text-secondary))] text-sm mb-8">
          The requested resource does not exist or has been decommissioned.
        </p>
        <Link href="/" className="glitch-button glitch-button--primary">
          Return to Base
        </Link>
      </div>
    </div>
  );
}
