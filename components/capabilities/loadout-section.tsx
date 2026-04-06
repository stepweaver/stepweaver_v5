"use client";

import type { IconType } from "react-icons";
import {
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiSupabase,
  SiPostgresql,
  SiZapier,
  SiStripe,
  SiNotion,
  SiSlack,
  SiGithub,
  SiVercel,
  SiCloudflare,
} from "react-icons/si";
import { Cpu, Mail, Printer, ShoppingCart, Workflow, type LucideIcon } from "lucide-react";

type ToolIcon = IconType | LucideIcon;

const LOADOUT_GROUPS: {
  id: string;
  title: string;
  subtitle: string;
  tools: { code: string; name: string; role: string; icon: ToolIcon }[];
}[] = [
  {
    id: "SYS-01",
    title: "Core Systems",
    subtitle: "Primary application stack used across recurring projects",
    tools: [
      { code: "NXT", name: "Next.js", role: "App shell / routing / server actions", icon: SiNextdotjs },
      { code: "RCT", name: "React", role: "UI architecture / reusable components", icon: SiReact },
      { code: "TWD", name: "Tailwind CSS", role: "Interface styling / design system velocity", icon: SiTailwindcss },
      { code: "SBS", name: "Supabase", role: "Auth / realtime / database workflows", icon: SiSupabase },
      { code: "PG", name: "PostgreSQL", role: "Structured data / relational storage", icon: SiPostgresql },
    ],
  },
  {
    id: "SYS-02",
    title: "AI / Automation Bus",
    subtitle: "Model routing, workflow automation, content systems, and notifications",
    tools: [
      { code: "LLM", name: "LLM Routing", role: "AI chat / model abstraction / routing", icon: Cpu },
      { code: "N8N", name: "n8n", role: "Workflow orchestration / automation chains", icon: Workflow },
      { code: "ZAP", name: "Zapier", role: "Connector glue / lightweight automations", icon: SiZapier },
      { code: "NOT", name: "Notion API", role: "CMS / editorial content / publishing", icon: SiNotion },
      { code: "SLK", name: "Slack", role: "Operational notifications / integrations", icon: SiSlack },
    ],
  },
  {
    id: "SYS-03",
    title: "Commerce / Ops Integrations",
    subtitle: "Payments, fulfillment, messaging, reporting, source control, deployment, edge delivery",
    tools: [
      { code: "STR", name: "Stripe", role: "Payments / checkout / billing flows", icon: SiStripe },
      { code: "PTY", name: "Printify", role: "Print-on-demand fulfillment", icon: Printer },
      { code: "RSD", name: "Resend", role: "Transactional email / notifications", icon: Mail },
      { code: "OPS", name: "POS / QuickBooks", role: "Operational reporting / business integrations", icon: ShoppingCart },
      { code: "GIT", name: "GitHub", role: "Source control / workflows / versioning", icon: SiGithub },
      { code: "VCL", name: "Vercel", role: "Deployment / edge / cron surfaces", icon: SiVercel },
      { code: "CFL", name: "Cloudflare", role: "DNS / performance / edge delivery", icon: SiCloudflare },
    ],
  },
];

const FEATURED_TESTIMONIAL = {
  quote:
    "Stephen has a great tenacity to solve problems in the world of technical development and engineering. We were fortunate enough to work alongside him multiple times, in which he delivered the dependable digital foundations for our Clients. With each project, his work significantly improved and become more operational. For those needing a digital facelift - it's not your job to understand how it's done. Instead, focus on finding someone you trust to help craft your vision inside your digital landscape. Stephen is one of those someones. God Bless.",
  attribution: "HERO POINT CONSULTING",
  role: "Agency Partner (Testimonial from Griffin H.)",
};

function ToolModule({
  code,
  name,
  role,
  icon: Icon,
}: {
  code: string;
  name: string;
  role: string;
  icon: ToolIcon;
}) {
  return (
    <article className="group rounded-sm border border-[rgb(var(--neon)/0.12)] bg-[rgb(var(--panel)/0.35)] p-2.5 transition-colors duration-200 hover:border-[rgb(var(--neon)/0.3)] hover:bg-[rgb(var(--panel)/0.55)]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.18em] text-[rgb(var(--text-label))]">{code}</div>
          <h4 className="mt-0.5 font-[var(--font-ibm)] text-sm uppercase tracking-[0.05em] text-[rgb(var(--neon))] break-words">
            {name}
          </h4>
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-[rgb(var(--window)/0.35)]">
          <Icon size={14} className="text-[rgb(var(--neon)/0.8)] transition-transform duration-200 group-hover:scale-110" aria-hidden />
        </div>
      </div>
      <div className="h-px w-full bg-[rgb(var(--neon)/0.2)]" />
      <p className="mt-2 font-[var(--font-ibm)] text-xs leading-relaxed text-[rgb(var(--text-secondary))]">{role}</p>
    </article>
  );
}

export function LoadoutSection() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="font-[var(--font-ocr)] text-xs tracking-[0.18em] text-[rgb(var(--text-label))] uppercase sm:text-sm">Loadout</p>
        <h2 className="font-[var(--font-ibm)] text-xl sm:text-2xl text-[rgb(var(--text-color))] leading-tight">
          Tools that support the system.
        </h2>
        <p className="text-[rgb(var(--text-secondary))] text-sm max-w-2xl leading-relaxed">
          After 8+ years across operations and software, the stack below is what shows up in real builds.
        </p>
      </div>

      <div className="space-y-2 max-w-6xl">
        {LOADOUT_GROUPS.map((group) => (
          <section
            key={group.id}
            className="rounded-sm border border-[rgb(var(--border)/0.15)] bg-[rgb(var(--panel)/0.2)] p-2.5 md:p-3"
          >
            <div className="mb-3 flex flex-col gap-1.5 border-b border-[rgb(var(--neon)/0.15)] pb-2 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.18em] text-[rgb(var(--text-label))]">{group.id}</div>
                <h3 className="mt-0.5 font-[var(--font-ibm)] text-lg uppercase tracking-[0.04em] text-[rgb(var(--neon))] break-words">
                  {group.title}
                </h3>
              </div>
              <p className="max-w-xl font-[var(--font-ibm)] text-xs text-[rgb(var(--text-meta))]">{group.subtitle}</p>
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {group.tools.map((tool) => (
                <ToolModule key={tool.code} {...tool} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="max-w-6xl space-y-3">
        <p className="font-[var(--font-ocr)] text-xs tracking-[0.18em] text-[rgb(var(--text-label))] uppercase sm:text-sm">Field report</p>
        <h3 className="font-[var(--font-ibm)] text-base sm:text-lg text-[rgb(var(--neon))] font-bold uppercase tracking-wider">
          External validation
        </h3>
        <div className="relative border border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.25)] p-2.5 md:p-3">
          <div className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l border-t border-[rgb(var(--neon)/0.6)]" />
          <div className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r border-t border-[rgb(var(--neon)/0.25)]" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b border-l border-[rgb(var(--neon)/0.25)]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b border-r border-[rgb(var(--neon)/0.6)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_12px] opacity-10" />
          <p className="relative font-[var(--font-ibm)] text-xs md:text-sm text-[rgb(var(--text-secondary))] leading-relaxed mb-2.5">
            {FEATURED_TESTIMONIAL.quote}
          </p>
          <p className="relative font-[var(--font-ibm)] text-xs text-[rgb(var(--text-meta))] uppercase tracking-[0.1em]">
            {FEATURED_TESTIMONIAL.attribution}
            {FEATURED_TESTIMONIAL.role ? ` · ${FEATURED_TESTIMONIAL.role}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
