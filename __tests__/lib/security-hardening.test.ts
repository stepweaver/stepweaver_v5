import { resolveProjectCaseStudy } from "@/lib/chat/resolve-case-study";
import { isValidLatLon } from "@/lib/weather/openweather";
import { stripHeaderUnsafe } from "@/lib/email/strip-header-unsafe";
import { contactSchema } from "@/lib/validation/contact.schema";

describe("resolveProjectCaseStudy", () => {
  it("loads title and description from the server catalog", () => {
    const dossier = resolveProjectCaseStudy("ai-integrations");
    expect(dossier?.slug).toBe("ai-integrations");
    expect(dossier?.title).toBe("AI Integrations");
    expect(dossier?.summary.length).toBeGreaterThan(20);
  });

  it("ignores unknown slugs instead of trusting client text", () => {
    expect(resolveProjectCaseStudy("not-a-real-project")).toBeUndefined();
  });
});

describe("weather coordinates", () => {
  it("accepts South Bend and rejects out-of-range values", () => {
    expect(isValidLatLon(41.6764, -86.252)).toBe(true);
    expect(isValidLatLon(91, 0)).toBe(false);
    expect(isValidLatLon(0, 181)).toBe(false);
    expect(isValidLatLon(Number.NaN, 0)).toBe(false);
  });
});

describe("contact header safety", () => {
  it("strips CR/LF from names", () => {
    expect(stripHeaderUnsafe("Jane\r\nBcc: victim@example.com")).toBe(
      "Jane Bcc: victim@example.com"
    );
  });

  it("rejects a name that is only control characters", () => {
    expect(contactSchema.safeParse({
      name: "\n\r",
      email: "a@b.com",
      message: "hello there",
    }).success).toBe(false);
  });
});
