import Link from "next/link";
import { ArrowLeft, BookOpen, Shield, MessageSquare } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";

export const metadata = {
  title: "Yankee Samurai",
  description: "Reflection on language, discipline, and consequence.",
  robots: { index: false, follow: false },
};

const THEMES = [
  { label: "Language", tag: "WPN" },
  { label: "Discipline", tag: "DSC" },
  { label: "Consequence", tag: "CNS" },
  { label: "Precision", tag: "PRC" },
];

function SidebarPanel({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="surface-panel p-3">
      {label ? (
        <p className="font-[var(--font-ocr)] text-xs tracking-[0.25em] text-[rgb(var(--neon)/0.45)] uppercase mb-2">
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export default function YankeeSamuraiPage() {
  return (
    <ErrorBoundary>
      <div className="relative h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
        <div className="relative z-10 flex flex-col h-full">
          <header className="shrink-0 border-b border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--border)/0.35)] backdrop-blur-sm px-3 sm:px-5 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="inline-flex items-center text-[rgb(var(--neon)/0.7)] hover:text-[rgb(var(--neon))] font-[var(--font-ocr)] text-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <span className="text-[rgb(var(--neon)/0.15)] hidden sm:inline">│</span>
              <BookOpen className="w-3.5 h-3.5 text-[rgb(var(--neon)/0.7)]" />
              <span className="font-[var(--font-ocr)] text-xs tracking-[0.3em] text-[rgb(var(--neon)/0.7)] uppercase">
                REFL-00
              </span>
              <span className="text-[rgb(var(--neon)/0.15)] hidden sm:inline">│</span>
              <span className="font-[var(--font-ibm)] text-xs text-[rgb(var(--text-secondary))] hidden sm:inline truncate max-w-[200px]">
                Yankee Samurai
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[rgb(var(--neon))] opacity-40 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[rgb(var(--neon))]" />
                </span>
                <span className="font-[var(--font-ocr)] text-xs tracking-[0.15em] text-[rgb(var(--neon)/0.7)] uppercase">
                  Loaded
                </span>
              </span>
            </div>
          </header>

          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            <aside className="hidden lg:flex lg:flex-col lg:w-72 2xl:w-80 shrink-0 border-r border-[rgb(var(--neon)/0.15)] overflow-y-auto">
              <div className="p-3 space-y-3 flex-1">
                <SidebarPanel label="SYS.BRIEF">
                  <p className="font-[var(--font-ibm)] text-base text-[rgb(var(--text-color))] leading-snug">Yankee Samurai</p>
                  <p className="font-[var(--font-ocr)] text-sm text-[rgb(var(--text-secondary))] leading-relaxed mt-2">
                    A reflection on language as weapon, discipline under consequence, and the weight of words.
                  </p>
                  <div className="mt-3 w-full h-px bg-gradient-to-r from-[rgb(var(--neon)/0.3)] via-[rgb(var(--neon)/0.1)] to-transparent" />
                  <p className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon)/0.5)] mt-2">Easter egg. Not indexed.</p>
                </SidebarPanel>

                <SidebarPanel label="LINK">
                  <Link
                    href="/"
                    className="inline-flex items-center text-[rgb(var(--neon))] font-[var(--font-ocr)] text-sm hover:text-[rgb(var(--neon)/0.8)] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                    Return home
                  </Link>
                </SidebarPanel>

                <div>
                  <p className="font-[var(--font-ocr)] text-xs tracking-[0.25em] text-[rgb(var(--neon)/0.4)] uppercase px-1 mb-2">
                    Themes
                  </p>
                  <div className="space-y-1.5">
                    {THEMES.map((t) => (
                      <div
                        key={t.tag}
                        className="group flex items-start gap-2.5 px-3 py-2.5 rounded-sm bg-[rgb(var(--border)/0.25)] border border-[rgb(var(--neon)/0.08)] hover:border-[rgb(var(--neon)/0.25)] hover:bg-[rgb(var(--border)/0.35)] transition-all duration-200"
                      >
                        <Shield className="w-3.5 h-3.5 text-[rgb(var(--neon)/0.55)] mt-0.5 shrink-0 group-hover:text-[rgb(var(--neon)/0.8)] transition-colors" />
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <p className="font-[var(--font-ibm)] text-xs text-[rgb(var(--text-color)/0.9)] group-hover:text-[rgb(var(--neon)/0.9)] transition-colors">
                              {t.label}
                            </p>
                            <span className="font-[var(--font-ocr)] text-[8px] text-[rgb(var(--neon)/0.25)]">{t.tag}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-1 space-y-1">
                  <div className="flex items-center gap-2 font-[var(--font-ocr)] text-xs text-[rgb(var(--text-meta))]">
                    <span className="w-1 h-1 rounded-full bg-[rgb(var(--neon)/0.3)]" />
                    <span>Personal reflection</span>
                  </div>
                  <div className="flex items-center gap-2 font-[var(--font-ocr)] text-xs text-[rgb(var(--text-meta))]">
                    <MessageSquare className="w-3 h-3 text-[rgb(var(--neon)/0.3)]" />
                    <span>Language is weapon</span>
                  </div>
                </div>
              </div>
            </aside>

            <section className="flex-1 min-h-0 flex flex-col">
              <div className="shrink-0 bg-[rgb(var(--border)/0.35)] border-b border-[rgb(var(--neon)/0.2)] px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3 h-3 text-[rgb(var(--neon)/0.5)]" />
                  <span className="font-[var(--font-ocr)] text-xs tracking-[0.18em] text-[rgb(var(--neon)/0.4)] uppercase">
                    Document
                  </span>
                </div>
                <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--text-meta))] hidden sm:inline">REFL-01</span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
                <article className="max-w-2xl mx-auto space-y-6 font-[var(--font-ibm)] text-[rgb(var(--text-color)/0.9)] text-base sm:text-lg leading-relaxed">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-[var(--font-ibm)] text-[rgb(var(--neon))] mb-6 border-b border-[rgb(var(--neon)/0.3)] pb-4">
                    Yankee Samurai
                  </h1>

                  <p>
                    There is no certificate that says it. No official designation. No patch stitched onto a sleeve. The
                    phrase exists somewhere between joke and oath. But it has weight. And I carry it carefully.
                  </p>

                  <p>
                    When I was in the service, I was given a creed. It was not written for public consumption. It was
                    something I internalized. It said &quot;language is my weapon&quot; — not my sword, not my rifle. My
                    language. And it said I must not make an error. Because error could mean miscalculation or escalation.
                    It could mean someone doesn&apos;t come home. That kind of pressure reshapes you. It makes you slower
                    to speak. It makes you suspicious of certainty. It makes you allergic to exaggeration. You begin to
                    understand that words are not symbols. They are levers.
                  </p>

                  <p>
                    The term &quot;Yankee Samurai&quot; is not official. It&apos;s not historical doctrine. It&apos;s
                    metaphor. It likely emerged among American linguists trained at the Defense Language Institute. And
                    like all good metaphors, it works because it points at something real. The historical samurai were not
                    just warriors in lacquered armor. Most of them were bureaucrats. Administrators. Educated retainers
                    bound by discipline and service. During long periods of peace, they studied. They wrote. They
                    governed. The word samurai means &quot;one who serves.&quot; Not one who conquers. That distinction
                    matters. The West romanticized the blade. But the reality was restraint. The code wasn&apos;t about
                    violence. It was about order.
                  </p>

                  <p>
                    The phrase as we use it today is almost certainly modern military vernacular. Esprit de corps. A way
                    of saying: we are trained differently. We fight differently. We serve differently. Myth unexamined
                    becomes propaganda. Metaphor examined becomes philosophy.
                  </p>

                  <p>
                    So what is a Yankee Samurai? Not a warrior in the cinematic sense. Not a cosplay aesthetic. Not
                    cultural appropriation. It&apos;s discipline under consequence. It&apos;s the understanding that
                    language shapes reality. It&apos;s the refusal to speak casually about things that can cause harm.
                    It&apos;s living with the knowledge that narratives can mobilize nations — or destroy them.
                  </p>

                  <p>
                    When you&apos;ve been trained to parse signal from noise in environments where mistakes matter, you
                    don&apos;t just turn that off. You see propaganda differently. You hear manipulation differently.
                    You recognize when language is being engineered to trigger rather than inform. And once you see it,
                    you cannot unsee it. That is both a gift and a burden.
                  </p>

                  <p>
                    The samurai served a lord. The linguist served a mission. The modern Yankee Samurai serves something
                    harder to define. Truth, maybe. Or integrity. Or simply the discipline of refusing to be sloppy in a
                    world that profits from sloppiness. I don&apos;t carry a sword. I carry pattern recognition. I carry
                    skepticism. I carry the habit of checking twice before speaking once. And when I resist, I try to
                    resist with precision. Not volume or rage. Because I know better. And once you know better, you are
                    responsible for what you do with <strong>that knowledge.</strong>
                  </p>

                  <footer className="mt-16 pt-8 border-t border-[rgb(var(--neon)/0.2)]">
                    <Link
                      href="/"
                      className="inline-flex items-center text-[rgb(var(--neon))] hover:text-[rgb(var(--neon)/0.8)] font-[var(--font-ibm)] text-sm transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                      Back
                    </Link>
                  </footer>
                </article>
              </div>
            </section>
          </div>

          <footer className="shrink-0 border-t border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--border)/0.35)] backdrop-blur-sm px-3 sm:px-5 py-1.5 flex items-center gap-2 sm:gap-3 overflow-x-auto">
            <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--neon)/0.6)] whitespace-nowrap">
              <span className="font-sans">»</span> REFL-00
            </span>
            <span className="text-[rgb(var(--neon)/0.15)]">│</span>
            <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--text-meta))] uppercase whitespace-nowrap">
              Yankee Samurai
            </span>
            <span className="text-[rgb(var(--neon)/0.15)] hidden sm:inline">│</span>
            <span className="font-[var(--font-ocr)] text-xs text-[rgb(var(--text-meta))] uppercase whitespace-nowrap hidden sm:inline">
              Easter egg
            </span>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
}
