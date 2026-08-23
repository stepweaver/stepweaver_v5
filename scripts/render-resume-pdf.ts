import { existsSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { buildResumeHtml } from "../lib/data/resume-html";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = resolve(root, "scripts/.resume-print.html");
const authoredPdf = resolve(root, "public/weaver_resume.pdf");
const generatedPdf = resolve(root, "scripts/.generated-resume.pdf");
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const force = process.argv.includes("--force");

if (existsSync(authoredPdf) && !force) {
  console.error(
    "Refusing to overwrite public/weaver_resume.pdf (authored downloadable resume).\n" +
      "Pass --force only if you intend to replace that file."
  );
  process.exit(1);
}

writeFileSync(htmlPath, buildResumeHtml(), "utf8");

const fileUrl = `file:///${htmlPath.replaceAll("\\", "/")}`;
const pdfPath = force ? authoredPdf : generatedPdf;
const result = spawnSync(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${pdfPath}`,
    "--print-to-pdf-no-header",
    fileUrl,
  ],
  { stdio: "inherit" }
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Wrote ${pdfPath}`);
