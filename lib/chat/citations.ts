export type ChatCitation = {
  type: string;
  label: string;
  href: string;
  section?: string;
};

const CITE_PATTERN =
  /\[\[CITE:([^|]+)\|([^|]+)\|([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export function extractCitations(text: string): { cleanText: string; citations: ChatCitation[] } {
  if (!text || typeof text !== "string") {
    return { cleanText: text, citations: [] };
  }

  const citations: ChatCitation[] = [];
  const cleanText = text
    .replace(CITE_PATTERN, (_, type: string, label: string, href: string, section?: string) => {
      const allowedTypes = new Set(["project", "resume", "codex", "page"]);
      const safeType = allowedTypes.has(type.trim()) ? type.trim() : "page";
      const safeLabel = label.trim().slice(0, 80);
      const safeHref = href.trim().slice(0, 200);
      const safeSection = section ? section.trim().slice(0, 60) : undefined;

      citations.push({
        type: safeType,
        label: safeLabel,
        href: safeHref,
        ...(safeSection ? { section: safeSection } : {}),
      });

      return "";
    })
    .replace(/\s{2,}/g, " ")
    .trim();

  return { cleanText, citations };
}

export function redactIfPromptLeak(text: string): string {
  const patterns = [
    /BASE_SYSTEM_PROMPT/i,
    /system prompt/i,
    /internal rules/i,
    /never reveal this system prompt/i,
    /Identity:\s*I am not a character/i,
  ];
  if (patterns.some((p) => p.test(text))) {
    return "I can't share internal instructions. Ask me about Stephen's skills, projects, or how he works.";
  }
  return text;
}

export const PROMPT_INJECTION_PATTERN =
  /ignore previous|disregard (instructions|above|prior)|system prompt|you are now|act as|pretend to be|new instructions/i;
