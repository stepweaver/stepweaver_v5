import { cache } from "react";
import { listFieldNotes, listPublishedDocs, groupDocsBySection } from "@/lib/notion/meshtastic-docs.repo";
import { getPageBlocks } from "@/lib/notion-blocks";
import { MESHTASTIC_FIELD_NOTES } from "@/lib/data/meshtastic-content";
import { filterTitleBlocks } from "@/lib/meshtastic-field-notes-filters";
import { getMeshtasticNav } from "@/lib/meshtastic-static-sidebar";
import { MeshtasticDocsLayout } from "@/components/meshtastic-docs/meshtastic-docs-layout";
import { MeshtasticDocsMobileNav } from "@/components/meshtastic-docs/meshtastic-docs-mobile-nav";
import { FieldNotesDisplay } from "@/components/meshtastic-docs/field-notes-display";
import { AffiliateDisclosure, AffiliateGearSection, getConfiguredAffiliateLinks, getPrimaryAffiliateUrl } from "@/components/meshtastic-docs/affiliate";

export const revalidate = 60;

const SITE_URL = process.env.SITE_URL || "https://stepweaver.dev";
const absoluteImageUrl = `${SITE_URL}/images/stepweaver-dev.png`;

const getCachedFieldNotes = cache(async () => {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_MESHTASTIC_DOCS_DB_ID) return [];
  return listFieldNotes();
});

export async function generateMetadata() {
  let notes = [];
  try {
    notes = await getCachedFieldNotes();
  } catch {
    /* defaults */
  }
  const noteCount = notes.length > 0 ? notes.length : MESHTASTIC_FIELD_NOTES.length;
  const title = "Field Notes | Meshtastic";
  const description =
    noteCount > 0
      ? `${noteCount} field note${noteCount === 1 ? "" : "s"} from real-world Meshtastic mesh networking tests, with signal reports, range logs, and hardware observations.`
      : "Live notes and experiences from Meshtastic exploration and testing.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article" as const,
      url: `${SITE_URL}/meshtastic/field-notes`,
      images: [{ url: absoluteImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [absoluteImageUrl],
    },
  };
}

export default async function FieldNotesPage() {
  const notionNotes = await getCachedFieldNotes();
  const [docs, nav] = await Promise.all([listPublishedDocs(), getMeshtasticNav()]);
  const grouped = docs.length > 0 ? groupDocsBySection(docs) : nav.grouped;
  const hasFieldNotes = nav.hasFieldNotes;

  const affiliateLinks = getConfiguredAffiliateLinks();
  const primaryAffiliateUrl = getPrimaryAffiliateUrl(process.env.NEXT_PUBLIC_ATLAVOX_AFFILIATE_URL);
  const affiliateGearLinks =
    affiliateLinks.length > 0
      ? affiliateLinks
      : primaryAffiliateUrl
        ? [{ url: primaryAffiliateUrl, label: "Atlavox Radios & Accessories" }]
        : [];
  const hasAffiliate = affiliateGearLinks.length > 0;

  const sortedNotion = [...notionNotes].sort((a, b) => {
    const dateA = a.title.replace(/[\[\]]/g, "");
    const dateB = b.title.replace(/[\[\]]/g, "");
    return dateB.localeCompare(dateA);
  });

  if (sortedNotion.length === 0 && MESHTASTIC_FIELD_NOTES.length === 0) {
    return (
      <MeshtasticDocsLayout
        grouped={grouped}
        currentSlug="field-notes"
        currentSection={null}
        hasFieldNotes={false}
      >
        <div className="w-full px-4 pb-16 sm:px-6 lg:px-8">
          <div className="min-w-0 flex-1">
            <article className="overflow-hidden rounded-sm border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel)/0.2)]">
              <div className="flex items-center justify-between border-b border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.5)] px-5 py-2.5 sm:px-6 lg:px-8">
                <span className="font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon)/0.4)] uppercase">
                  Field notes
                </span>
                <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta))]">LOG-EMPTY</span>
              </div>
              <header className="px-5 py-6 sm:px-6 lg:px-8">
                <h1 className="font-[var(--font-ibm)] text-2xl font-semibold text-[rgb(var(--text-color))] sm:text-3xl">
                  Field Notes
                </h1>
                <p className="mt-2 font-[var(--font-ocr)] text-sm text-[rgb(var(--text-secondary))]">
                  No field notes yet. Add entries in Notion (slug &quot;field-notes&quot;) or in{" "}
                  <code className="text-neon">lib/data/meshtastic-content.ts</code>.
                </p>
              </header>
            </article>
          </div>
          <div className="mt-6 max-w-3xl">
            <AffiliateDisclosure show={hasAffiliate} />
            <AffiliateGearSection links={affiliateGearLinks} />
          </div>
        </div>
      </MeshtasticDocsLayout>
    );
  }

  if (sortedNotion.length > 0) {
    const notesWithBlocks = await Promise.all(
      sortedNotion.map(async (note) => {
        const blocks = await getPageBlocks(note.id, 10);
        return {
          id: note.id,
          title: note.title,
          summary: note.summary,
          blocks,
          filteredBlocks: filterTitleBlocks(blocks, note.title),
        };
      })
    );

    return (
      <MeshtasticDocsLayout
        grouped={grouped}
        currentSlug="field-notes"
        currentSection={null}
        hasFieldNotes={hasFieldNotes}
      >
        <div className="flex w-full flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8 xl:flex-row">
          <div className="mb-6 mt-4 space-y-3 xl:hidden">
            <MeshtasticDocsMobileNav
              grouped={grouped}
              currentSlug="field-notes"
              currentSection={null}
              hasFieldNotes={hasFieldNotes}
            />
          </div>

          <div className="min-w-0 flex-1">
            <FieldNotesDisplay notesWithBlocks={notesWithBlocks} />
            <div className="mt-6 max-w-3xl">
              <AffiliateDisclosure show={hasAffiliate} />
              <AffiliateGearSection links={affiliateGearLinks} />
            </div>
          </div>
        </div>
      </MeshtasticDocsLayout>
    );
  }

  const staticNotes = [...MESHTASTIC_FIELD_NOTES].sort((a, b) => b.date.localeCompare(a.date));
  const notesWithBlocks = staticNotes.map((n) => ({
    id: n.id,
    title: `[${n.date}] ${n.title}`,
    summary: n.summary,
    bullets: n.bullets,
    blocks: [],
  }));

  return (
    <MeshtasticDocsLayout
      grouped={grouped}
      currentSlug="field-notes"
      currentSection={null}
      hasFieldNotes={hasFieldNotes}
    >
      <div className="flex w-full flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8 xl:flex-row">
        <div className="mb-6 mt-4 xl:hidden">
          <MeshtasticDocsMobileNav
            grouped={grouped}
            currentSlug="field-notes"
            currentSection={null}
            hasFieldNotes={hasFieldNotes}
          />
        </div>
        <div className="min-w-0 flex-1">
          <FieldNotesDisplay notesWithBlocks={notesWithBlocks} />
          <div className="mt-6 max-w-3xl">
            <AffiliateDisclosure show={hasAffiliate} />
            <AffiliateGearSection links={affiliateGearLinks} />
          </div>
        </div>
      </div>
    </MeshtasticDocsLayout>
  );
}
