/**
 * Canonical career positioning.
 * Resume, About, agents, structured data, and the PDF all read from here
 * so the story cannot drift into "the Next.js guy" or "fast learner."
 */

export const ROLES = [
  "Software Developer",
  "Business Systems Developer",
  "Automation & AI Integration",
] as const;

export const ROLE_LINE = ROLES.join(" · ");
export const ROLE_LINE_PDF = ROLES.join(" | ");

export const CONTACT = {
  email: "stephen@stepweaver.dev",
  site: "stepweaver.dev",
  siteUrl: "https://stepweaver.dev",
  location: "Granger, IN",
} as const;

export const PROFESSIONAL_SUMMARY = [
  "Product-minded software developer and systems builder with 9+ years across development, business analysis, data, and operations.",
  "Repeatedly enters unfamiliar domains and tools, learns what the work requires, and ships working applications, automation, and integrations.",
  "Builds full-stack and AI-assisted systems with TypeScript, JavaScript, Python, SQL, and modern web platforms.",
  "Communicates across technical and nontechnical teams, translating business requirements into operable software.",
] as const;

export const IDENTITY_STATEMENT =
  "Business systems developer. I translate messy workflows into working software, dashboards, automation, and AI-assisted tools.";

export const ABOUT_STATEMENT =
  "I came into software through operations, analysis, and real-world process work. My edge is not just shipping code. It is understanding how work moves through a team, where it breaks, and how to turn that into dependable software, automation, and AI-assisted tools. I learn aggressively when the problem requires something I don't yet know. Frameworks, APIs, infrastructure, and domains are tools to acquire, not boundaries around the work I can do.";

export const CURRENTLY_BUILDING = {
  label: "Currently building",
  items: ["SvelteKit", "Svelte 5", "TypeScript", "Cloudflare", "D1", "Drizzle"] as const,
  note: "Rebuilding λstepweaver from Next.js in SvelteKit as an instructional lab: routing, loading, component boundaries, TypeScript data modeling, then Cloudflare, D1, and Drizzle. Not a mechanical framework port.",
  href: "/lab",
} as const;

export const LEARNING_LAB = {
  eyebrow: "Current build / learning lab",
  title: "Rebuilding λstepweaver in SvelteKit",
  body: "Rebuilding my production portfolio from Next.js in SvelteKit to learn the framework from first principles: routing, loading, component boundaries, TypeScript data modeling, and eventually Cloudflare/D1 infrastructure. This is an instructional rebuild rather than a framework port; I rebuild each system only after I understand its SvelteKit equivalent.",
  href: "/lab",
} as const;

export const TRAJECTORY = {
  framing:
    "That path is not a pile of disconnected careers. It is the same move, repeated: enter a complex system, learn it, become useful.",
  items: [
    "U.S. Air Force veteran; Airborne Cryptologic Linguist",
    "Restaurant operations and management",
    "Business analysis",
    "Self-taught developer",
    "Current lab: SvelteKit, Cloudflare, D1, Drizzle",
  ] as const,
} as const;

export const LINKEDIN = {
  headline: ROLE_LINE,
  about: [
    PROFESSIONAL_SUMMARY[0],
    "",
    ABOUT_STATEMENT,
    "",
    "The evidence is the trajectory, not a slogan: cryptologic linguistics, restaurant operations, campus transaction systems, SQL and Tableau, Python automation, web applications, realtime data, LLM-assisted tools, and a current first-principles rebuild of my portfolio in SvelteKit.",
    "",
    "Open to software developer, full-stack, business systems, and automation roles.",
    "",
    "Site: https://stepweaver.dev",
    "Resume: https://stepweaver.dev/resume",
    "Lab: https://stepweaver.dev/lab",
  ].join("\n"),
} as const;
