import { MESHTASTIC_DOCS, MESHTASTIC_FIELD_NOTES } from "@/lib/data/meshtastic-content";
import {
  groupDocsBySection,
  listFieldNotes,
  listPublishedDocs,
  type MeshtasticPublishedDoc,
  type GroupedMeshtasticSection,
} from "@/lib/notion/meshtastic-docs.repo";

const SLUG_TO_SECTION: Record<string, string> = {
  about: "About",
  overview: "Overview",
  "getting-started": "Getting Started",
  hardware: "Hardware",
};

/** Static docs as the same shape as Notion entries for shared sidebar / prev-next. */
function staticDocsAsPublished(): MeshtasticPublishedDoc[] {
  return MESHTASTIC_DOCS.map((d, i) => ({
    id: `static-${d.slug}`,
    title: d.title,
    slug: d.slug,
    section: SLUG_TO_SECTION[d.slug] ?? "Guide",
    order: i,
    status: "Published",
  }));
}

function getStaticGroupedDocs(): GroupedMeshtasticSection[] {
  return groupDocsBySection(staticDocsAsPublished());
}

export async function getMeshtasticNav(): Promise<{
  grouped: GroupedMeshtasticSection[];
  hasFieldNotes: boolean;
}> {
  let notionDocs: MeshtasticPublishedDoc[] = [];
  let notionFieldNotes: MeshtasticPublishedDoc[] = [];
  try {
    [notionDocs, notionFieldNotes] = await Promise.all([listPublishedDocs(), listFieldNotes()]);
  } catch {
    /* use static */
  }

  const hasStaticFieldNotes = MESHTASTIC_FIELD_NOTES.length > 0;
  const hasFieldNotes = notionFieldNotes.length > 0 || hasStaticFieldNotes;

  if (notionDocs.length > 0) {
    return {
      grouped: groupDocsBySection(notionDocs),
      hasFieldNotes,
    };
  }

  return {
    grouped: getStaticGroupedDocs(),
    hasFieldNotes,
  };
}
