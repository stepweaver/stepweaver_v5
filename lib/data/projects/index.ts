import type { Project } from "../projects.schema";
import { aiIntegrations } from "./ai-integrations";
import { cerebro } from "./cerebro";
import { cashflowLedger } from "./cashflow-ledger";
import { diceRoller } from "./dice-roller";
import { lambdaHeatingAir } from "./lambda-heating-air";
import { n8nAutomations } from "./n8n-automations";
import { soapStache } from "./soap-stache";
import { terminalUI } from "./terminal-ui";

const ALL_PROJECTS: Project[] = [
  aiIntegrations,
  cerebro,
  cashflowLedger,
  diceRoller,
  lambdaHeatingAir,
  n8nAutomations,
  soapStache,
  terminalUI,
];

const FEATURED_ORDER = [
  "ai-integrations",
  "terminal-ui",
  "n8n-automations",
  "cerebro",
  "cashflow-ledger",
  "dice-roller",
  "lambda-heating-air",
  "soap-stache",
];

const HOMEPAGE_CAROUSEL_SLUGS = [
  "ai-integrations",
  "terminal-ui",
  "n8n-automations",
  "cerebro",
  "cashflow-ledger",
  "dice-roller",
  "lambda-heating-air",
  "soap-stache",
];

export function getAllProjects(): Project[] {
  return ALL_PROJECTS;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return ALL_PROJECTS.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return FEATURED_ORDER
    .map((slug) => ALL_PROJECTS.find((p) => p.slug === slug))
    .filter((p): p is Project => p !== undefined);
}

export function getHomepageCarouselProjects(): Project[] {
  return HOMEPAGE_CAROUSEL_SLUGS
    .map((slug) => ALL_PROJECTS.find((p) => p.slug === slug))
    .filter((p): p is Project => p !== undefined);
}

export function getProjectsByTag(tag: string): Project[] {
  return ALL_PROJECTS.filter((p) => p.tags.includes(tag));
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const p of ALL_PROJECTS) {
    for (const t of p.tags) tagSet.add(t);
  }
  return Array.from(tagSet).sort();
}

export function getProjectSlugs(): string[] {
  return ALL_PROJECTS.map((p) => p.slug);
}
