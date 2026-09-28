import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import manifest from "@/app/manifest";
import { PWA_ICON_FILES, PWA_NAME, PWA_SHORT_NAME } from "@/lib/site/pwa";

function iconFile(urlPath: string): string {
  if (urlPath === PWA_ICON_FILES.favicon) {
    return resolve(process.cwd(), "app/favicon.ico");
  }
  return resolve(process.cwd(), "public", urlPath.replace(/^\//, ""));
}

describe("install metadata", () => {
  it("publishes a standalone manifest with the lambda mark at homescreen sizes", () => {
    const webApp = manifest();

    expect(webApp.name).toBe(PWA_NAME);
    expect(webApp.short_name).toBe(PWA_SHORT_NAME);
    expect(webApp.display).toBe("standalone");
    expect(webApp.icons?.map((icon) => icon.src)).toEqual([
      PWA_ICON_FILES.icon192,
      PWA_ICON_FILES.icon512,
      PWA_ICON_FILES.maskable192,
      PWA_ICON_FILES.maskable512,
      PWA_ICON_FILES.appleTouch,
    ]);
  });

  it("ships opaque PNG icons, including the root apple-touch-icon iOS looks up", () => {
    for (const urlPath of Object.values(PWA_ICON_FILES)) {
      const file = iconFile(urlPath);
      expect(existsSync(file)).toBe(true);
      const bytes = readFileSync(file);
      expect(bytes.length).toBeGreaterThan(100);
      if (urlPath.endsWith(".png")) {
        expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      }
      if (urlPath.endsWith(".ico")) {
        expect(bytes.readUInt16LE(2)).toBe(1);
      }
    }
  });
});
