import type { Project } from "../projects.schema";

/** λcerebro: memory-layer architecture (v3 `lcerebro`, v5 schema). */
export const lcerebro: Project = {
  slug: "lcerebro",
  title: "λcerebro",
  description:
    "A memory-layer architecture in progress: durable storage in Supabase, pgvector retrieval, and MCP access across AI clients.",
  status: "coming-soon",
  tags: ["AI", "Memory Layer", "MCP", "Supabase", "Postgres", "Build in progress"],
  keywords: ["cerebro", "mcp", "pgvector", "supabase", "embeddings", "memory"],
  imageUrl: "/images/cerebro.png",
  builtFor: "Builders who need portable AI context across tools",
  solved: "Siloed prompts and notes that do not survive across clients or sessions",
  delivered: [
    "Phase 1 architecture: capture, store, embed, retrieve, expose via MCP",
    "Schema story: thoughts + vector(1536) + metadata + database-side similarity",
    "Security framing: RLS, server paths, MCP access key boundary",
  ],
  cardDescription: "AI memory layer: Supabase, pgvector, MCP",
  cardBuiltFor: "Cross-tool AI workflows",
  cardSolved: "Context trapped in single chat products",
  cardDelivered: ["Storage model", "Vector retrieval", "MCP interface"],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Phase 1 is architecture first. The goal is to make context portable instead of trapping it inside one chat product. λcerebro is the memory layer in a modular agent stack: durable context, retrieval, and knowledge flow between systems, not a UI feature bolted on at the end.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Most AI workflows are siloed across tools",
        "Useful history and prompts are hard to search, reuse, or carry forward",
        "Without a retrieval layer, every session starts cold",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Capture raw text, generate embeddings and metadata, store in Supabase",
        "Expose retrieval through MCP so clients stay model-agnostic",
        "Keep capture, storage, retrieval, and client interface explicitly separated",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Core storage model centers on durable thought records: content, metadata, timestamps, and vector(1536) embeddings",
        "Retrieval via database-side similarity (e.g. match_thoughts-style function) with thresholded search and metadata-aware filtering",
        "MCP as the tool-shaped interface so ChatGPT, Claude Desktop, Claude Code, and compatible clients share one memory layer",
        "Remote Edge Function gateway for capture, search, list, and stats flows",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Vector-based semantic retrieval sized to embedding column conventions",
        "Indexes aligned to vector similarity, JSON metadata filtering, and recent-item browsing",
        "Row-level security with privileged operations on secret-bearing server paths",
        "Access-key boundary on MCP URL separate from public site surface",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Supabase / Postgres holds raw text, JSON metadata, timestamps, and embeddings in one system",
        "pgvector for semantic search; ranking logic lives close to the data where possible",
        "Metadata extraction treated as secondary; retrieval is embedding-driven, not dependent on perfect tagging",
        "Cold-start and remote connector ergonomics framed as operational tradeoffs, not assumed strengths",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      content:
        "The case study describes a concrete Phase 1 system shape (storage, retrieval, security, MCP delivery) while keeping work-in-progress status explicit so claims stay credible.",
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "No dedicated public λcerebro repo or live MCP demo linked from this page yet",
        "This portfolio repo does not expose inspectable runtime code for the full schema, Edge Function, or deployment flow",
        "Remote Edge Functions can add latency; responsiveness should be described as an operational concern until measured",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Supabase", category: "Platform" },
        { name: "PostgreSQL", category: "Database" },
        { name: "pgvector", category: "Retrieval" },
        { name: "MCP", category: "Interface" },
        { name: "OpenRouter", category: "Embeddings / metadata" },
      ],
    },
  ],
};

export default lcerebro;
