import {
  nextAppearance,
  parseLegacyTheme,
  parseStoredOverride,
  resolveNextOverride,
  resolveVisualScheme,
} from "@/lib/theme/color-scheme";
import { isColorScheme, isNoveltyTheme, isThemeId, THEMES } from "@/lib/theme/themes";

describe("color-scheme storage parsing", () => {
  it("accepts only light and dark as overrides", () => {
    expect(parseStoredOverride("light")).toBe("light");
    expect(parseStoredOverride("dark")).toBe("dark");
    expect(parseStoredOverride("amber")).toBeNull();
    expect(parseStoredOverride("system")).toBeNull();
    expect(parseStoredOverride(null)).toBeNull();
  });

  it("ignores legacy novelty theme ids", () => {
    expect(parseLegacyTheme("light")).toBe("light");
    expect(parseLegacyTheme("skynet")).toBeNull();
    expect(parseLegacyTheme("monochrome")).toBeNull();
  });
});

describe("Lea two-state override model", () => {
  it("stores an override only when it differs from the system scheme", () => {
    expect(resolveNextOverride("dark", "dark")).toBe("light");
    expect(resolveNextOverride("light", "dark")).toBeNull();
    expect(resolveNextOverride("light", "light")).toBe("dark");
    expect(resolveNextOverride("dark", "light")).toBeNull();
  });
});

describe("visual scheme", () => {
  it("follows system when there is no data-theme and no override", () => {
    expect(
      resolveVisualScheme({ override: null, systemScheme: "light", dataTheme: undefined })
    ).toBe("light");
  });

  it("uses a professional data-theme over system", () => {
    expect(
      resolveVisualScheme({ override: null, systemScheme: "dark", dataTheme: "light" })
    ).toBe("light");
  });

  it("treats novelty palettes as light or dark for the two-state toggle", () => {
    expect(
      resolveVisualScheme({ override: "dark", systemScheme: "dark", dataTheme: "amber" })
    ).toBe("dark");
    expect(
      resolveVisualScheme({
        override: null,
        systemScheme: "dark",
        dataTheme: "solarized",
      })
    ).toBe("light");
  });
});

describe("theme id guards", () => {
  it("distinguishes color schemes from novelty themes", () => {
    expect(isColorScheme("dark")).toBe(true);
    expect(isNoveltyTheme("amber")).toBe(true);
    expect(isNoveltyTheme("light")).toBe(false);
    expect(isThemeId("skynet")).toBe(true);
    expect(isThemeId("system")).toBe(false);
  });

  it("cycles appearance ids", () => {
    expect(nextAppearance("dark", THEMES)).toBe("light");
    expect(nextAppearance("skynet", THEMES)).toBe("dark");
  });
});
