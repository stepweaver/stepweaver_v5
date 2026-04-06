import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import {
  getDocBySlug,
  getFlatDocList,
  getMeshtasticNotionConfigIssue,
  listPublishedDocs,
} from "@/lib/notion/meshtastic-docs.repo";
import { getPageBlocks } from "@/lib/notion-blocks";
import { getHeadingsFromBlocks } from "@/lib/meshtastic-docs-headings";
import { NotionBlockBody } from "@/components/codex/notion-block-body";
import { MESHTASTIC_DOC_BY_SLUG, MESHTASTIC_DOCS, type MeshtasticDoc } from "@/lib/data/meshtastic-content";
import { getMeshtasticNav } from "@/lib/meshtastic-static-sidebar";
import { MeshtasticDocsLayout } from "@/components/meshtastic-docs/meshtastic-docs-layout";
import { MeshtasticDocsMobileNav } from "@/components/meshtastic-docs/meshtastic-docs-mobile-nav";
import { OnThisPage } from "@/components/meshtastic-docs/on-this-page";
import { DocPrevNext } from "@/components/meshtastic-docs/doc-prev-next";
import {
  AffiliateDisclosure,
  AffiliateGearSection,
  AffiliateHardwareBlock,
  AffiliateIntroCTA,
  getConfiguredAffiliateLinks,
  getPrimaryAffiliateUrl,
} from "@/components/meshtastic-docs/affiliate";

export const revalidate = 60;
export const dynamicParams = true;

const SITE_URL = process.env.SITE_URL || "https://stepweaver.dev";
const DEFAULT_PREVIEW = "/images/stepweaver-dev.png";

export async function generateStaticParams() {
  const slugs = new Set(MESHTASTIC_DOCS.map((d) => d.slug));
  if (getMeshtasticNotionConfigIssue() === "ok") {
    try {
      const docs = await listPublishedDocs();
      for (const d of docs) {
        if (d.slug) slugs.add(d.slug);
      }
    } catch {
      /* static only */
    }
  }
  return Array.from(slugs, (slug) => ({ slug }));
}

function formatUpdated(lastEditedTime?: string) {
  if (!lastEditedTime) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(
      new Date(lastEditedTime)
    );
  } catch {
    return "";
  }
}

function shouldShowHardwareAffiliate(meta: { section: string; slug: string }): boolean {
  return meta.section === "Hardware" || ["choosing-a-device", "heltec-v3"].includes(meta.slug);
}

function StaticDocSections({ doc }: { doc: MeshtasticDoc }) {
  return (
    <>
      {doc.sections.map((section, i) =>
        section.type === "p" && section.text ? (
          <p key={i} className="text-[rgb(var(--text-secondary))] leading-relaxed">
            {section.text}
          </p>
        ) : section.type === "ul" && section.items?.length ? (
          <ul key={i} className="list-disc space-y-2 pl-5 text-[rgb(var(--text-secondary))]">
            {section.items.map((item) => (
              <li key={item} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        ) : null
      )}
    </>
  );
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const base = SITE_URL;

  const notionDoc = getMeshtasticNotionConfigIssue() === "ok" ? await getDocBySlug(slug) : null;
  const staticDoc = MESHTASTIC_DOC_BY_SLUG[slug];

  if (notionDoc) {
    const title = notionDoc.title || "Meshtastic Doc";
    const description =
      notionDoc.summary || `${title} – Meshtastic Field Notes | Stephen Weaver`;
    const previewImage = notionDoc.coverImage || DEFAULT_PREVIEW;
    const absoluteImageUrl = previewImage.startsWith("http") ? previewImage : `${base}${previewImage}`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article" as const,
        url: `${base}/meshtastic/${slug}`,
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

  if (staticDoc) {
    const title = staticDoc.title;
    const firstPara = staticDoc.sections.find((s) => s.type === "p" && s.text)?.text ?? `${title} · Meshtastic docs`;
    return {
      title,
      description: firstPara.slice(0, 160),
      openGraph: { title, description: firstPara.slice(0, 160), url: `${base}/meshtastic/${slug}` },
    };
  }

  return { title: "Not Found" };
}

export default async function MeshtasticDocPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const notionDoc = getMeshtasticNotionConfigIssue() === "ok" ? await getDocBySlug(slug) : null;
  const staticDoc = MESHTASTIC_DOC_BY_SLUG[slug];

  if (!notionDoc && !staticDoc) notFound();

  const { grouped, hasFieldNotes } = await getMeshtasticNav();
  const flatList = getFlatDocList(grouped);

  const affiliateLinks = getConfiguredAffiliateLinks();
  const primaryAffiliateUrl = getPrimaryAffiliateUrl(process.env.NEXT_PUBLIC_ATLAVOX_AFFILIATE_URL);
  const affiliateGearLinks =
    affiliateLinks.length > 0
      ? affiliateLinks
      : primaryAffiliateUrl
        ? [{ url: primaryAffiliateUrl, label: "Atlavox Radios & Accessories" }]
        : [];
  const hasAffiliate = affiliateGearLinks.length > 0;

  if (notionDoc) {
    const [blocks] = await Promise.all([getPageBlocks(notionDoc.id, 10)]);
    const headings = getHeadingsFromBlocks(blocks);
    const doc = notionDoc;

    return (
      <MeshtasticDocsLayout
        grouped={grouped}
        currentSlug={doc.slug}
        currentSection={doc.section}
        hasFieldNotes={hasFieldNotes}
      >
        <div className="flex w-full flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8 xl:flex-row">
          <div className="mb-6 space-y-3 xl:hidden">
            <div className="flex gap-3">
              <MeshtasticDocsMobileNav
                grouped={grouped}
                currentSlug={doc.slug}
                currentSection={doc.section}
                hasFieldNotes={hasFieldNotes}
              />
              {hasFieldNotes ? (
                <Link
                  href="/meshtastic/field-notes"
                  className="inline-flex items-center justify-center rounded-sm border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--panel)/0.5)] px-3 py-2 font-[var(--font-ocr)] text-xs uppercase tracking-[0.2em] text-[rgb(var(--neon)/0.9)] transition-colors hover:border-[rgb(var(--neon)/0.4)] hover:bg-[rgb(var(--panel)/0.7)] hover:text-neon"
                >
                  Field Notes
                </Link>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <article
              key={doc.slug}
              className="overflow-hidden rounded-sm border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel)/0.2)]"
            >
              <div className="flex items-center justify-between border-b border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.5)] px-5 py-2.5 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3 text-[rgb(var(--neon)/0.4)]" aria-hidden />
                  <span className="font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon)/0.4)] uppercase">
                    {doc.section || "Document"}
                  </span>
                </div>
                <span className="hidden font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta))] sm:inline">
                  MESH-DOC
                </span>
              </div>

              <header className="border-b border-[rgb(var(--neon)/0.1)] px-5 py-6 sm:px-6 lg:px-8">
                <h1 className="font-[var(--font-ibm)] text-2xl font-semibold text-[rgb(var(--text-color))] sm:text-3xl">
                  {doc.title}
                </h1>
                {doc.summary ? (
                  <p className="mt-2 font-[var(--font-ocr)] text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                    {doc.summary}
                  </p>
                ) : null}
                {doc.lastEditedTime ? (
                  <p className="mt-3 font-[var(--font-ocr)] text-[11px] text-[rgb(var(--neon)/0.4)]">
                    Updated {formatUpdated(doc.lastEditedTime)}
                  </p>
                ) : null}
              </header>

              <div className="px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="max-w-3xl">
                  <AffiliateDisclosure show={hasAffiliate} />
                  <AffiliateIntroCTA affiliateUrl={primaryAffiliateUrl} />
                  {blocks.length > 0 ? (
                    <div className="prose prose-invert max-w-none">
                      <NotionBlockBody blocks={blocks} />
                    </div>
                  ) : (
                    <p className="font-[var(--font-ocr)] text-[rgb(var(--text-secondary))]">No content yet.</p>
                  )}
                  {shouldShowHardwareAffiliate(doc) ? (
                    <AffiliateHardwareBlock affiliateUrl={primaryAffiliateUrl} />
                  ) : null}
                  <DocPrevNext flatList={flatList} currentSlug={doc.slug} />
                  <AffiliateGearSection links={affiliateGearLinks} />
                </div>
              </div>
            </article>
          </div>

          <OnThisPage headings={headings} />
        </div>
      </MeshtasticDocsLayout>
    );
  }

  const doc = staticDoc!;
  const sectionMeta = flatList.find((p) => p.slug === slug);
  const section = sectionMeta?.section ?? "Guide";

  return (
    <MeshtasticDocsLayout
      grouped={grouped}
      currentSlug={slug}
      currentSection={section}
      hasFieldNotes={hasFieldNotes}
    >
      <div className="flex w-full flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8 xl:flex-row">
        <div className="mb-6 space-y-3 xl:hidden">
          <div className="flex gap-3">
            <MeshtasticDocsMobileNav
              grouped={grouped}
              currentSlug={slug}
              currentSection={section}
              hasFieldNotes={hasFieldNotes}
            />
            {hasFieldNotes ? (
              <Link
                href="/meshtastic/field-notes"
                className="inline-flex items-center justify-center rounded-sm border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--panel)/0.5)] px-3 py-2 font-[var(--font-ocr)] text-xs uppercase tracking-[0.2em] text-[rgb(var(--neon)/0.9)] transition-colors hover:border-[rgb(var(--neon)/0.4)] hover:bg-[rgb(var(--panel)/0.7)] hover:text-neon"
              >
                Field Notes
              </Link>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <article
            key={slug}
            className="overflow-hidden rounded-sm border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel)/0.2)]"
          >
            <div className="flex items-center justify-between border-b border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.5)] px-5 py-2.5 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 text-[rgb(var(--neon)/0.4)]" aria-hidden />
                <span className="font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon)/0.4)] uppercase">
                  {section}
                </span>
              </div>
              <span className="hidden font-[var(--font-ocr)] text-[10px] text-[rgb(var(--text-meta))] sm:inline">
                MESH-DOC
              </span>
            </div>

            <header className="border-b border-[rgb(var(--neon)/0.1)] px-5 py-6 sm:px-6 lg:px-8">
              <h1 className="font-[var(--font-ibm)] text-2xl font-semibold text-[rgb(var(--text-color))] sm:text-3xl">
                {doc.title}
              </h1>
            </header>

            <div className="space-y-5 px-5 py-6 text-sm sm:px-6 lg:px-8 lg:py-8">
              <div className="max-w-3xl space-y-5">
                <AffiliateDisclosure show={hasAffiliate} />
                <AffiliateIntroCTA affiliateUrl={primaryAffiliateUrl} />
                <StaticDocSections doc={doc} />
                {shouldShowHardwareAffiliate({ section, slug }) ? (
                  <AffiliateHardwareBlock affiliateUrl={primaryAffiliateUrl} />
                ) : null}
                <DocPrevNext flatList={flatList} currentSlug={slug} />
                <AffiliateGearSection links={affiliateGearLinks} />
              </div>
            </div>
          </article>
        </div>
      </div>
    </MeshtasticDocsLayout>
  );
}
