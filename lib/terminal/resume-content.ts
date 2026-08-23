import type { LineVariant } from "@/components/terminal/types";
import { RESUME_PDF } from "@/lib/data/identity";

function line(content: string, variant: LineVariant = "default") {
  return { content, variant };
}

export function resumeMenuLines() {
  return [
    line("STEPHEN WEAVER / RESUME", "success"),
    line("", "default"),
    line("Sections: summary | experience | projects | education | download | exit | help", "dimmed"),
    line("", "default"),
  ];
}

export function handleResumeCommand(raw: string): { lines: { content: string; variant: LineVariant }[]; exit?: boolean } {
  const cmd = raw.trim().toLowerCase();

  switch (cmd) {
    case "exit":
    case "quit":
    case "cancel":
      return { lines: [line("Exited resume mode.", "success")], exit: true };
    case "help":
    case "?":
      return { lines: [...resumeMenuLines()] };
    case "summary":
    case "skills":
      return {
        lines: [
          line("SUMMARY", "lambda"),
          line("", "default"),
          line("Software developer · business systems developer · automation & AI integration", "default"),
          line("Messy workflows → working software, dashboards, and operational systems", "dimmed"),
          line("Enters unfamiliar domains and tools, learns what the work requires, ships", "dimmed"),
          line("TypeScript/JavaScript/Python/SQL · React/Node.js · Postgres/Supabase", "dimmed"),
          line("Currently building: SvelteKit · Svelte 5 · Cloudflare · D1 · Drizzle", "dimmed"),
          line("", "default"),
          line("Type another section or exit.", "dimmed"),
        ],
      };
    case "experience":
    case "work":
      return {
        lines: [
          line("EXPERIENCE", "lambda"),
          line("", "default"),
          line("Shipping web platforms, internal tools, and integrations.", "default"),
          line("Focus: clear requirements, fast iteration, operable systems.", "dimmed"),
          line("", "default"),
          line("See /work and /about for case-shaped detail.", "dimmed"),
        ],
      };
    case "projects":
      return {
        lines: [
          line("PROJECTS", "lambda"),
          line("", "default"),
          line("Browse dossiers: stepweaver.dev/work", "success"),
          line("Includes automation, data, and AI-assisted tooling.", "dimmed"),
        ],
      };
    case "education":
    case "edu":
      return {
        lines: [
          line("EDUCATION", "lambda"),
          line("", "default"),
          line("Degrees and certifications: see PDF resume for full detail.", "default"),
        ],
      };
    case "download":
    case "pdf":
      if (typeof window !== "undefined") {
        const a = document.createElement("a");
        a.href = RESUME_PDF.href;
        a.download = RESUME_PDF.downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      return {
        lines: [
          line(`Downloading ${RESUME_PDF.downloadName} …`, "success"),
          line(`(If nothing happens, open ${RESUME_PDF.href})`, "dimmed"),
        ],
      };
    default:
      return {
        lines: [
          line("Unknown section: " + cmd, "error"),
          line("Try: summary, experience, projects, education, download", "dimmed"),
        ],
      };
  }
}
