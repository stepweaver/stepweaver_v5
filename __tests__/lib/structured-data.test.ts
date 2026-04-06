import { generateStructuredData, siteBaseUrl } from "@/lib/structured-data";

describe("structured-data", () => {
  it("siteBaseUrl falls back to production host", () => {
    expect(siteBaseUrl()).toMatch(/^https?:\/\//);
  });

  it("generateStructuredData returns website, person, breadcrumb", () => {
    const sd = generateStructuredData();
    expect(sd.website["@type"]).toBe("WebSite");
    expect(sd.person["@type"]).toBe("Person");
    expect(sd.breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(Array.isArray(sd.breadcrumb.itemListElement)).toBe(true);
  });
});
