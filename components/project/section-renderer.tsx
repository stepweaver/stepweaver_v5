import type { ProjectSection } from "@/lib/data/projects.schema";

export function ProjectSectionRenderer({ section }: { section: ProjectSection }) {
  switch (section.type) {
    case "overview":
    case "problem":
    case "solution":
    case "outcome":
      return <TextSection section={section} />;
    case "features":
    case "engineering":
    case "architecture":
    case "key-features":
    case "keyboard-shortcuts":
      return <BulletSection section={section} />;
    case "tech-stack":
      return <TechStackSection section={section} />;
    case "evidence-bar":
      return <EvidenceSection section={section} />;
    case "tradeoffs":
      return <TradeoffsSection section={section} />;
    case "project-structure":
    case "terminal-integration":
      return <ItemListSection section={section} />;
    default:
      return null;
  }
}

function TextSection({ section }: { section: ProjectSection }) {
  if (!section.content) return null;
  return (
    <div className="surface-panel p-6">
      <div className="text-label mb-3">{section.title.toUpperCase()}</div>
      <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
        {section.content}
      </p>
      {section.bullets && section.bullets.length > 0 && (
        <ul className="mt-4 space-y-2">
          {section.bullets.map((bullet, i) => (
            <li key={i} className="text-sm text-[rgb(var(--text-secondary))] flex gap-2">
              <span className="text-[rgb(var(--neon))] shrink-0">▸</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BulletSection({ section }: { section: ProjectSection }) {
  if (!section.bullets || section.bullets.length === 0) return null;
  return (
    <div className="surface-panel p-6">
      <div className="text-label mb-3">{section.title.toUpperCase()}</div>
      <ul className="space-y-2">
        {section.bullets.map((bullet, i) => (
          <li key={i} className="text-sm text-[rgb(var(--text-secondary))] flex gap-2">
            <span className="text-[rgb(var(--neon))] shrink-0 mt-0.5">▸</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TechStackSection({ section }: { section: ProjectSection }) {
  if (!section.techStack || section.techStack.length === 0) return null;
  return (
    <div className="surface-panel p-6">
      <div className="text-label mb-3">{section.title.toUpperCase()}</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {section.techStack.map((tech) => (
          <div
            key={tech.name}
            className="border border-[rgb(var(--border)/0.2)] p-3"
          >
            <div className="text-[rgb(var(--text-color))] text-sm font-[var(--font-ibm)]">
              {tech.name}
            </div>
            {tech.category && (
              <div className="text-[rgb(var(--text-meta))] text-xs mt-1">
                {tech.category}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceSection({ section }: { section: ProjectSection }) {
  if (!section.evidence || section.evidence.length === 0) return null;
  return (
    <div className="surface-panel p-6">
      <div className="text-label mb-3">{section.title.toUpperCase()}</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {section.evidence.map((item) => (
          <div key={item.label}>
            <div className="text-[rgb(var(--neon))] text-lg font-[var(--font-ibm)]">
              {item.value}
            </div>
            <div className="text-[rgb(var(--text-meta))] text-xs mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TradeoffsSection({ section }: { section: ProjectSection }) {
  if (!section.items || section.items.length === 0) return null;
  return (
    <div className="surface-panel p-6">
      <div className="text-label mb-3">{section.title.toUpperCase()}</div>
      <div className="space-y-3">
        {section.items.map((item) => (
          <div key={item.label} className="border-l-2 border-[rgb(var(--warn)/0.4)] pl-4">
            <div className="text-[rgb(var(--text-color))] text-sm font-[var(--font-ibm)]">
              {item.label}
            </div>
            {item.description && (
              <div className="text-[rgb(var(--text-secondary))] text-xs mt-1">
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemListSection({ section }: { section: ProjectSection }) {
  if (!section.items || section.items.length === 0) return null;
  return (
    <div className="surface-panel p-6">
      <div className="text-label mb-3">{section.title.toUpperCase()}</div>
      <div className="space-y-2">
        {section.items.map((item) => (
          <div key={item.label} className="text-sm text-[rgb(var(--text-secondary))]">
            <span className="text-[rgb(var(--neon))] font-[var(--font-ocr)]">{item.label}</span>
            {item.description && (
              <span className="ml-2 text-[rgb(var(--text-meta))]">{item.description}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
