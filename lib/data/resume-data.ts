export const resumeData = {
  identity: {
    eyebrow: "λstepweaver // resume",
    title: "Stephen Weaver",
    subtitle: "Full-Stack Engineer · Systems Builder · Automation & AI Integration",
    statement:
      "Business-facing developer and systems builder. I translate messy workflows into working software, dashboards, automation, and AI-assisted tools.",
  },
  summary: {
    title: "Professional Summary",
    body: [
      "Full-stack and DevOps engineer with 9+ years’ experience spanning software development, data analysis, and operations.",
      "Former Air Force linguist and business analyst who builds AI-enabled web apps, real-time systems, and automation workflows that reduce friction and improve operations.",
      "Specializes in Next.js, Supabase, PostgreSQL, LLM integrations, and pragmatic DevOps pipelines.",
      "Adept at translating business requirements into scalable systems and communicating across technical and non-technical teams.",
    ] as const,
  },
  skills: {
    title: "Skills",
    groups: [
      {
        label: "Languages & frameworks",
        items: ["JavaScript", "TypeScript", "Python", "SQL", "React", "Next.js", "Node.js", "Tailwind CSS"] as const,
      },
      {
        label: "Databases & tooling",
        items: ["PostgreSQL", "Supabase (Auth & Realtime)", "Neon", "MongoDB"] as const,
      },
      {
        label: "DevOps & cloud",
        items: ["Vercel", "AWS", "Git/GitHub", "CI/CD pipelines", "Docker", "Netlify"] as const,
      },
      {
        label: "Automation & AI",
        items: ["LLM integrations (OpenAI/Groq)", "Prompt engineering", "Resend", "n8n", "Zapier", "Auth.js", "Stripe"] as const,
      },
      {
        label: "Data & reporting",
        items: ["Tableau", "SQL analytics", "Excel", "Data storytelling"] as const,
      },
      {
        label: "Business analysis",
        items: ["Requirements gathering", "Agile/Scrum", "UAT", "Documentation", "Stakeholder collaboration"] as const,
      },
    ] as const,
  },
  experience: {
    title: "Professional Experience",
    roles: [
      {
        org: "λstepweaver",
        role: "Founder & Developer",
        when: "Nov 2024 – Present",
        bullets: [
          "Designed and launched a real-time silent-auction platform for a school fundraiser using Next.js and Supabase Realtime; delivered guided bidder onboarding, alias-bidding, realtime updates, donor portals, and admin workflows; hardened trust boundaries and server-side rule enforcement.",
          "Built a cash-flow planning app with Next.js, Neon Postgres, Drizzle ORM, and Auth.js; implemented paycheck-window UX and a status pipeline (scheduled → pending → paid) with month templates to reduce cash flow surprises and provide reusable budgeting patterns.",
          "Developed λlambda, an LLM chat agent integrated into the portfolio and terminal; built server-only prompts, model routing between Groq and OpenAI, multimodal support, and terminal command interface; implemented prompt-injection filtering and provider fallback.",
          "Delivered custom automation systems for small-business clients including lead capture, operational dashboards, and AI scheduling tools; leveraged n8n/Zapier, Python, and Google APIs to eliminate manual steps and improve data visibility.",
          "Managed delivery from scoping and UX through deployment; configured environment-based deployments and iterated on feedback with clients.",
        ] as const,
      },
      {
        org: "University of Notre Dame",
        role: "Business Analyst",
        when: "Nov 2017 – May 2025",
        bullets: [
          "Managed SQL data pipelines and Tableau dashboards supporting campus meal-plan operations for thousands of students; automated monthly reporting and reduced manual reconciliation time.",
          "Administered the CSGold ID transaction system handling thousands of transactions per day; coordinated third-party integrations and implemented authentication updates.",
          "Automated procurement and meal-plan workflows using Python, SQL, and Excel macros, saving significant staff time.",
          "Led cross-functional user-acceptance testing for new modules: gathered requirements, translated between stakeholders and developers, and ensured smooth rollouts.",
        ] as const,
      },
      {
        org: "University of Notre Dame",
        role: "Operations Manager",
        when: "Aug 2014 – Nov 2017",
        bullets: [
          "Oversaw logistics, labor scheduling, and inventory management for high-volume campus dining operations; implemented metrics-driven performance management to optimize costs and throughput.",
          "Managed daily operations across multiple dining halls; improved customer service and supported quality assurance programs.",
        ] as const,
      },
      {
        org: "U.S. Air Force",
        role: "Cryptologic Linguist",
        when: "Aug 2003 – Aug 2007",
        bullets: [
          "Translated and analyzed high-stakes foreign signal intelligence; produced mission-critical reports with high accuracy under tight deadlines.",
          "Built early expertise in pattern recognition, structured reporting, and mission-driven analysis that underpins current technical problem solving.",
        ] as const,
      },
    ] as const,
  },
  projects: {
    title: "Selected Projects",
    items: [
      {
        label: "Silent Auction Platform",
        summary:
          "Real-time auction system for a school PTO fundraiser; built with Next.js, Supabase, and Resend; includes alias-based bidding, realtime updates, donor portals, and admin dashboards.",
        href: "/projects/silent-auction",
      },
      {
        label: "Bill Planner",
        summary:
          "Cash-flow planning app built with Next.js, Neon, and Drizzle ORM; supports mapping income to bills, status pipeline, HUD metrics, and reusable month templates.",
        href: "/projects/bill-planner",
      },
      {
        label: "λlambda LLM Chat Agent",
        summary:
          "Portfolio-native LLM advocate with Groq/OpenAI routing, channel-aware chat across website and terminal, prompt-injection filtering, and provider fallback strategies.",
        href: "/projects/llambda-llm-agent",
      },
    ] as const,
  },
  education: {
    title: "Education",
    items: [
      "B.A. Communication Studies — Grand Valley State University",
      "A.A. Business Administration — Ivy Tech Community College",
      "Certificate, Intensive Spanish Language Program — Defense Language Institute Foreign Language Center (DLI)",
    ] as const,
  },
} as const;

