import Link from "next/link";

type Props = {
  token: string;
  active: "daybook" | "footwear";
};

export function CarrierPrivateNav({ token, active }: Props) {
  const q = `?token=${encodeURIComponent(token)}`;
  const base =
    "inline-flex items-center justify-center border px-3 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.18em] uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))]";
  const on =
    "border-[rgb(var(--neon))] bg-[rgb(var(--neon)/0.15)] text-[rgb(var(--neon))]";
  const off =
    "border-[rgb(var(--neon)/0.25)] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--neon)/0.5)] hover:text-[rgb(var(--neon))]";

  return (
    <nav
      aria-label="Carrier daybook sections"
      className="flex flex-wrap gap-2 mb-6"
    >
      <Link
        href={`/log${q}`}
        className={`${base} ${active === "daybook" ? on : off}`}
        aria-current={active === "daybook" ? "page" : undefined}
      >
        Daily Field Log
      </Link>
      <Link
        href={`/log/footwear${q}`}
        className={`${base} ${active === "footwear" ? on : off}`}
        aria-current={active === "footwear" ? "page" : undefined}
      >
        Footwear Lab
      </Link>
    </nav>
  );
}
