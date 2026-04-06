import Link from "next/link";
import { redirect } from "next/navigation";
import { Radio } from "lucide-react";
import { getMeshtasticNotionConfigIssue, listPublishedDocs } from "@/lib/notion/meshtastic-docs.repo";
import { getMeshtasticNav } from "@/lib/meshtastic-static-sidebar";
import { MeshtasticDocsLayout } from "@/components/meshtastic-docs/meshtastic-docs-layout";

export const revalidate = 60;

const SITE_URL = process.env.SITE_URL || "https://stepweaver.dev";
const absoluteImageUrl = `${SITE_URL}/images/stepweaver-dev.png`;

export const metadata = {
  title: "Meshtastic Field Notes",
  description:
    "A beginner-to-operator path for Meshtastic: real hardware, real configs, and real mistakes. T-Beam, Heltec V3, channels, privacy, and range.",
  openGraph: {
    title: "Meshtastic Field Notes",
    description:
      "A beginner-to-operator path for Meshtastic: real hardware, real configs, and real mistakes.",
    type: "website" as const,
    url: `${SITE_URL}/meshtastic`,
    images: [{ url: absoluteImageUrl, width: 1200, height: 630, alt: "Meshtastic Field Notes" }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Meshtastic Field Notes",
    description:
      "A beginner-to-operator path for Meshtastic: real hardware, real configs, and real mistakes.",
    images: [absoluteImageUrl],
  },
};

export default async function MeshtasticPage() {
  let notionDocs: Awaited<ReturnType<typeof listPublishedDocs>> = [];
  try {
    notionDocs = await listPublishedDocs();
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("[meshtastic] listPublishedDocs:", err);
  }

  if (notionDocs.length > 0) {
    redirect(`/meshtastic/${notionDocs[0].slug}`);
  }

  const { grouped, hasFieldNotes } = await getMeshtasticNav();
  const configIssue = getMeshtasticNotionConfigIssue();
  const notionConfiguredButEmpty = configIssue === "ok" && notionDocs.length === 0;

  const configHint =
    configIssue === "missing_api_key"
      ? "This server has a Meshtastic database ID but NOTION_API_KEY is missing or blank. On Vercel, open the project’s Environment Variables: ensure NOTION_API_KEY is enabled for Production (not only Preview or Development), save, then trigger a new deployment."
      : configIssue === "invalid_database_id"
        ? "NOTION_MESHTASTIC_DOCS_DB_ID must be the full Notion database UUID (32 hex characters, with or without hyphens). Remove stray spaces, quotes, or line breaks from the value."
        : configIssue === "missing_database_id"
          ? "Set NOTION_MESHTASTIC_DOCS_DB_ID and NOTION_API_KEY, share the Meshtastic Docs database with your Notion integration, then redeploy. Until then, use the sidebar for bundled static chapters."
          : notionConfiguredButEmpty
            ? "The database is linked, but no published chapters were returned. In Notion, set Status = Published on doc pages (normal slugs must not be “field-notes”). If the integration cannot access the DB, check sharing in Notion. Server logs may show [meshtastic] listPublishedDocs for API errors."
            : "Open a chapter from the sidebar or read Field Notes. Bundled static pages ship with the site; when Notion returns published pages, the first chapter opens automatically from /meshtastic.";

  return (
    <MeshtasticDocsLayout
      grouped={grouped}
      currentSlug={null}
      currentSection={null}
      hasFieldNotes={hasFieldNotes}
      showFooterStatus
    >
      <div className="flex flex-1 items-center justify-center px-4 pb-16 pt-6">
        <div className="surface-panel w-full max-w-lg overflow-hidden rounded-sm">
          <div className="flex items-center justify-between border-b border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.5)] px-5 py-2.5">
            <span className="font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon)/0.4)] uppercase">
              Status
            </span>
            <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta))]">MESH-00</span>
          </div>
          <div className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Radio className="h-4 w-4 text-[rgb(var(--neon)/0.5)]" aria-hidden />
              <p className="font-[var(--font-ibm)] text-lg font-semibold text-neon">Meshtastic Field Notes</p>
            </div>
            <p className="font-[var(--font-ocr)] text-sm leading-relaxed text-[rgb(var(--text-secondary))]">{configHint}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {grouped[0]?.pages?.[0] ? (
                <Link
                  href={`/meshtastic/${grouped[0].pages[0].slug}`}
                  className="glitch-button glitch-button--primary text-xs"
                >
                  Start reading → {grouped[0].pages[0].title}
                </Link>
              ) : null}
              {hasFieldNotes ? (
                <Link href="/meshtastic/field-notes" className="glitch-button glitch-button--accent text-xs">
                  Field Notes
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </MeshtasticDocsLayout>
  );
}
