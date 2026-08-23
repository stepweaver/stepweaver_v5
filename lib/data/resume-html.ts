import { resumeData } from "./resume-data";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Standalone ATS-friendly HTML for the downloadable PDF. Same data as /resume. */
export function buildResumeHtml() {
  const { identity, summary, currentlyBuilding, skills, experience, projects, education } = resumeData;
  const summaryParagraph = summary.body.join(" ");

  const skillBlocks = skills.groups
    .map(
      (group) =>
        `<p><strong>${escapeHtml(group.label)}:</strong> ${escapeHtml(group.items.join(", "))}</p>`
    )
    .join("\n");

  const experienceBlocks = experience.roles
    .map((role) => {
      const bullets = role.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("\n");
      return `<section class="job">
  <div class="job-head">
    <h3>${escapeHtml(role.org)} — ${escapeHtml(role.role)}</h3>
    <p class="when">${escapeHtml(role.when)}</p>
  </div>
  <ul>
    ${bullets}
  </ul>
</section>`;
    })
    .join("\n");

  const projectBlocks = projects.items
    .map((p) => `<p><strong>${escapeHtml(p.label)}:</strong> ${escapeHtml(p.summary)}</p>`)
    .join("\n");

  const educationBlocks = education.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Stephen Weaver — Resume</title>
  <style>
    @page { size: letter; margin: 0.55in 0.6in; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #111;
      font-family: "Segoe UI", "Calibri", "Helvetica Neue", Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.35;
    }
    h1 {
      margin: 0 0 2px;
      font-size: 22pt;
      font-weight: 700;
      letter-spacing: 0.01em;
    }
    .title {
      margin: 0 0 4px;
      font-size: 11.5pt;
      font-weight: 600;
    }
    .contact {
      margin: 0 0 14px;
      font-size: 10pt;
      color: #333;
    }
    h2 {
      margin: 12px 0 6px;
      padding-bottom: 2px;
      font-size: 11pt;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-bottom: 1px solid #222;
    }
    p { margin: 0 0 8px; }
    ul { margin: 4px 0 8px; padding-left: 18px; }
    li { margin-bottom: 4px; }
    .job { margin-bottom: 10px; }
    .job-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: baseline;
    }
    .job-head h3 {
      margin: 0;
      font-size: 11pt;
    }
    .when {
      margin: 0;
      white-space: nowrap;
      font-size: 10pt;
      color: #333;
    }
    .note { font-size: 10pt; color: #333; margin-bottom: 8px; }
    a { color: inherit; text-decoration: none; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(identity.title)}</h1>
    <p class="title">${escapeHtml(identity.subtitlePdf)}</p>
    <p class="contact">${escapeHtml(identity.email)} | ${escapeHtml(identity.site)} | ${escapeHtml(identity.location)}</p>
  </header>

  <section>
    <h2>${escapeHtml(summary.title)}</h2>
    <p>${escapeHtml(summaryParagraph)}</p>
  </section>

  <section>
    <h2>${escapeHtml(skills.title)}</h2>
    ${skillBlocks}
    <p><strong>${escapeHtml(currentlyBuilding.label)}:</strong> ${escapeHtml(currentlyBuilding.items.join(" · "))}</p>
    <p class="note">${escapeHtml(currentlyBuilding.note)}</p>
  </section>

  <section>
    <h2>${escapeHtml(experience.title)}</h2>
    ${experienceBlocks}
  </section>

  <section>
    <h2>${escapeHtml(projects.title)}</h2>
    ${projectBlocks}
  </section>

  <section>
    <h2>${escapeHtml(education.title)}</h2>
    <ul>
      ${educationBlocks}
    </ul>
  </section>
</body>
</html>`;
}
