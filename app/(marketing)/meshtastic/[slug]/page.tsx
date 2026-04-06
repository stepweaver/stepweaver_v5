import { notFound } from "next/navigation";
import Link from "next/link";

const DOC_CONTENT: Record<string, { title: string; content: string }> = {
  about: { title: "About Meshtastic", content: "Meshtastic is an open-source, off-grid, encrypted communication platform using LoRa radio technology." },
  overview: { title: "Overview", content: "Meshtastic creates mesh networks of low-power radios that can send text messages without cellular or internet infrastructure." },
  "getting-started": { title: "Getting Started", content: "To get started with Meshtastic, you need a compatible device, the mobile app, and basic knowledge of radio frequencies in your region." },
  hardware: { title: "Hardware Guide", content: "Recommended hardware includes Heltec V3, TTGO T-Beam, and Raspberry Pi Pico W with LoRa modules." },
};

export function generateStaticParams() {
  return Object.keys(DOC_CONTENT).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = DOC_CONTENT[slug];
  if (!doc) return { title: "Not Found" };
  return { title: doc.title };
}

export default async function MeshtasticDocPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const doc = DOC_CONTENT[slug];
  if (!doc) notFound();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/meshtastic" className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors font-[var(--font-ocr)] tracking-wider mb-6 block">
          BACK TO MESHTASTIC
        </Link>
        <div className="surface-panel p-6 sm:p-8">
          <h1 className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))] mb-6">{doc.title}</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">{doc.content}</p>
        </div>
      </div>
    </div>
  );
}
