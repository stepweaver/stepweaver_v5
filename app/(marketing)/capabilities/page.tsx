import { LoadoutSection } from "@/components/capabilities/loadout-section";

export const metadata = {
  title: "Capabilities",
  description: "Loadout: core systems, automation bus, and commerce integrations that show up in real builds.",
};

export default function CapabilitiesPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">{"// CAPABILITIES"}</div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))] mb-3">Operator loadout</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm max-w-2xl leading-relaxed">
            Grouped systems and integrations with module codes. Same structure as the v3 Loadout, tuned for v5 spacing and readability.
          </p>
        </div>
        <LoadoutSection />
      </div>
    </div>
  );
}
