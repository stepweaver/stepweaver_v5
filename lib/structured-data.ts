const DEFAULT_BASE = "https://stepweaver.dev";

export function siteBaseUrl(): string {
  return (typeof process !== "undefined" && process.env.SITE_URL) || DEFAULT_BASE;
}

/** JSON-LD bundles (parity with v3 app/structured-data.js). */
export function generateStructuredData() {
  const baseUrl = siteBaseUrl();

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Stephen Weaver - λstepweaver",
    url: baseUrl,
    description:
      "Business-minded builder focused on web apps, automation, and AI-enabled tools that reduce friction and improve operations.",
    author: {
      "@type": "Person",
      name: "Stephen Weaver",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/codex?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const personData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Stephen Weaver",
    alternateName: "Yankee Samurai",
    jobTitle: "Full-Stack / Automation / AI",
    description:
      "Business-minded builder and former U.S. Air Force linguist (Airborne Cryptologic Linguist) focused on web apps, automation, and AI-enabled tools that turn messy workflows into usable systems.",
    url: baseUrl,
    image: `${baseUrl}/images/pixarMe.png`,
    sameAs: ["https://github.com/stepweaver", "https://bsky.app/profile/stepweaver.dev"],
    email: "stephen@stepweaver.dev",
    knowsAbout: [
      "Web applications",
      "Automation",
      "AI workflows",
      "Systems design",
      "Operational tooling",
      "Business analysis",
      "DevOps",
      "Next.js",
      "React",
      "JavaScript",
      "PostgreSQL",
    ],
    hasOccupation: {
      "@type": "Occupation",
      name: "Full-Stack Developer",
      occupationLocation: {
        "@type": "Country",
        name: "United States",
      },
      skills: "Business analysis, systems thinking, web applications, automation, AI workflows",
    },
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Resume", item: `${baseUrl}/resume` },
      { "@type": "ListItem", position: 3, name: "Codex", item: `${baseUrl}/codex` },
      { "@type": "ListItem", position: 4, name: "Terminal", item: `${baseUrl}/terminal` },
      { "@type": "ListItem", position: 5, name: "Contact", item: `${baseUrl}/contact` },
    ],
  };

  return {
    website: websiteData,
    person: personData,
    breadcrumb: breadcrumbData,
  };
}
