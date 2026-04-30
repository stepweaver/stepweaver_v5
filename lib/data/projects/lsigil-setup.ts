import type { Project } from "../projects.schema";

export const lsigilSetup: Project = {
  slug: "lsigil-setup",
  title: "λsigil Lead Ops Runtime",
  description:
    "λsigil began as OpenClaw setup and identity work, then grew into a local-first lead ops runtime for contractor prospecting: discovery, contact-path analysis, verification, approval-gated review, evidence notes, reporting, and constrained outreach drafting. TypeScript pipeline and Next.js operator console over append-only NDJSON; optional OpenRouter after acquisition for multi-pass review and drafts. Human sends only: no auto-send. First web-deployed console run completed against the same runtime used locally.",
  status: "live",
  tags: [
    "TypeScript",
    "Next.js",
    "Brave Search",
    "OpenClaw",
    "OpenRouter",
    "Lead ops",
    "Operational Systems",
    "λstepweaver",
  ],
  keywords: ["sigil", "lead-ops", "ndjson", "openrouter", "prospecting"],
  imageUrl: "/images/sigil.png",
  builtFor: "Internal commercial prospecting under λstepweaver",
  solved: "Keeping discovery, evidence bundles, contact-path judgment, and outreach prep in one runtime instead of scattered tabs and prompts",
  delivered: [
    "TypeScript pipeline plus Next.js console: evidence-oriented qualification on static HTML, resolver-backed notes and drafts, server-side actions, staged OpenRouter after acquisition, multi-shell adapters on one canonical `sigil` repo",
    "Workflow from discovery through verify, analyst-style model review, approve, notes, reports, and one-problem/one-offer drafts. Human sends, no auto-send.",
  ],
  cardDescription:
    "OpenClaw-hardened lead ops runtime: discovery, contact-path analysis (forms, booking, mail), verification, approval-gated review, evidence notes, reporting, constrained drafts. NDJSON + resolver, Next.js console, optional OpenRouter over evidence.",
  cardBuiltFor: "internal commercial prospecting under λstepweaver",
  cardSolved: "scattered tabs and prompts replacing a single inspectable runtime",
  cardDelivered: [
    "Evidence-oriented qualification on static HTML, resolver merge, server actions",
    "Optional OpenRouter for analyst-style passes over evidence, not only drafting",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Operator-facing lead ops in a dedicated `sigil` repo: CLI plus Next.js console on append-only NDJSON, resolver merge for notes and draft lifecycle, Brave- or seed-based discovery, evidence-oriented rubrics on static HTML, optional OpenRouter after fetch, shell adapters around one canonical pipeline.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Prospecting breaks when discovery, qualification, and outreach live in disconnected tabs and ad hoc prompts",
        "Need one execution path: acquire, inspect evidence, rank contact paths, verify, approve or reject, notes, reports, drafts, without auto-mail or model-as-CRM",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Full loop: acquire, fetch HTML into evidence view, rank contact paths, verify, approve/hold/reject, append notes, reports from pipeline state, constrained drafts under explicit gates",
        "Rubric and constraints in versioned files; behavior enforced by code, resolver, UI",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "File-driven operating context (profile, skills, prompts, runbooks, commercial-ops) plus TypeScript runtime and Next.js console",
        "Optional OpenRouter after acquisition: analyst/skeptic passes over evidence and constrained drafting, not crawler or autonomous send",
        "OpenClaw is one shell; canonical logic stays in `sigil`",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Discovery from seed URLs or Brave-backed scans; static HTML fetch (no shipped headless extraction)",
        "Contact-path extraction and rubric evaluation; verification before outreach prep",
        "Approval gating for drafts; outbound send outside the tool by design",
        "Append-only operator notes and draft events merged into each lead",
        "Reporting from pipeline state",
        "Constrained drafts: one concrete problem and one wedge offer per message",
        "Console actions server-side only; keys never in the browser",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Append-only NDJSON with resolver merging notes and draft lifecycle",
        "Qualification in code against fetched HTML, not a black-box agent loop",
        "Shell adapters for OpenClaw, OpenCode, Claw Code",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Working internal runtime: discovery through verification, approval-gated drafts, notes, reporting",
        "First successful web-deployed console run against the same pipeline used locally",
        "Inspectable local-first state instead of chat-only improvisation",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Human-gated: operator approves and sends; system does not auto-mail",
        "Qualification grounded in static HTML and explicit rules",
        "Not a CRM; narrow scope on acquisition, review, evidence, draft prep",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "TypeScript", category: "Runtime" },
        { name: "Next.js", category: "Console" },
        { name: "NDJSON", category: "State" },
        { name: "OpenRouter", category: "Optional AI" },
      ],
    },
  ],
};
