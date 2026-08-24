/**
 * Canonical career positioning.
 * Resume, About, agents, structured data, and the PDF all read from here
 * so the story cannot drift into "the Next.js guy" or "fast learner."
 *
 * Spec: SITE_PLAN.md
 */

export const PRIMARY_TITLE = "Business Systems Developer";

export const SUPPORTING_LINE =
  "Full-stack development · internal tools · automation · operational software";

/** Single title for resume, metadata, and HUD role. Not a pile of near-synonyms. */
export const ROLE_LINE = PRIMARY_TITLE;
export const ROLE_LINE_PDF = `${PRIMARY_TITLE} | ${SUPPORTING_LINE}`;

export const ROLES = [PRIMARY_TITLE] as const;

export const CONTACT = {
  email: "stephen@stepweaver.dev",
  site: "stepweaver.dev",
  siteUrl: "https://stepweaver.dev",
  location: "Granger, IN",
} as const;

/** Hand-authored file in public/. Do not regenerate over this path. */
export const RESUME_PDF = {
  href: "/weaver_resume.pdf",
  downloadName: "Stephen_Weaver_Resume.pdf",
} as const;

export const PROFESSIONAL_SUMMARY = [
  "Full-stack developer who ships production software for operations-heavy work: internal tools, workflow systems, and AI-assisted applications with TypeScript, JavaScript, Python, SQL, and modern web platforms.",
  "Nine years across business analysis, data, and operations, then independent product development. I enter unfamiliar domains, learn what the work requires, and deliver working applications—not slide decks.",
  "Communicates across technical and nontechnical teams, translating business requirements into operable software with tests, integrations, and deployment.",
] as const;

export const IDENTITY_STATEMENT =
  "Business Systems Developer. I write production software that turns messy workflows into working applications, dashboards, automation, and AI-assisted tools.";

export const ABOUT_STATEMENT =
  "I came into software through operations, analysis, and real-world process work. Then I learned to build the systems I used to specify. My edge is not just shipping code, and it is not analysis without implementation. It is understanding how work moves through a team, where it breaks, and writing the software that makes that work dependable. Frameworks, APIs, infrastructure, and domains are tools to acquire, not boundaries around the work I can do.";

export const CAREER_TRANSITION =
  "From 2017 to 2025 I was a business analyst at Notre Dame: SQL pipelines, Tableau, campus transaction systems, requirements, and UAT. In 2024 I started shipping production software independently as λstepweaver. I am currently in a field-operations chapter; that is context, not the hiring argument. The argument is the systems I build.";

export const HOW_I_WORK = [
  {
    step: "01",
    title: "Business analysis",
    body: "Map the real workflow, including exceptions, handoffs, and the data that actually moves.",
  },
  {
    step: "02",
    title: "System design",
    body: "Define boundaries, rules, and failure modes before picking a stack or reaching for an LLM.",
  },
  {
    step: "03",
    title: "Implementation",
    body: "Ship a working application: interface, data model, integrations, auth, and deployment.",
  },
] as const;

export const HOMEPAGE_EXPERIENCE = [
  {
    org: "λstepweaver",
    role: "Founder & Developer",
    when: "Nov 2024 – Present",
    body: "Designing and shipping production web applications: realtime systems, internal tools, automation, and AI-assisted products.",
  },
  {
    org: "University of Notre Dame",
    role: "Business Analyst",
    when: "Nov 2017 – May 2025",
    body: "SQL pipelines, Tableau, campus transaction systems, requirements, UAT, and vendor/developer translation.",
  },
] as const;

export const HOMEPAGE_CHAPTER_NOTE =
  "Currently in a field-operations chapter while building independently. Dates above match the résumé.";

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
    "Self-taught developer shipping production software",
    "Current lab: SvelteKit, Cloudflare, D1, Drizzle",
  ] as const,
} as const;

export const LINKEDIN = {
  headline: `${PRIMARY_TITLE} | ${SUPPORTING_LINE}`,
  about: [
    PROFESSIONAL_SUMMARY[0],
    "",
    ABOUT_STATEMENT,
    "",
    CAREER_TRANSITION,
    "",
    "The evidence is the trajectory, not a slogan: cryptologic linguistics, restaurant operations, campus transaction systems, SQL and Tableau, Python automation, web applications, realtime data, LLM-assisted tools, and a current first-principles rebuild of my portfolio in SvelteKit.",
    "",
    "Open to business systems, full-stack, internal tools, and automation roles.",
    "",
    "Site: https://stepweaver.dev",
    "Resume: https://stepweaver.dev/resume",
    "Lab: https://stepweaver.dev/lab",
  ].join("\n"),
} as const;
