/**
 * Optional generator for styles/themes.css; source of truth is themes.css itself.
 * If theme-data.json is added later, run: node gen-themes.js
 */
const fs = require("fs");
const path = require("path");
const dataPath = path.join(__dirname, "theme-data.json");
if (!fs.existsSync(dataPath)) {
  console.log("gen-themes: theme-data.json not present; edit styles/themes.css directly.");
  process.exit(0);
}
const themes = require("./theme-data.json");
let css = "/* Auto-generated from theme-data.json */\n@layer theme {\n";
for (const [name, t] of Object.entries(themes)) {
  css += `  [data-theme="${name}"] {\n`;
  for (const [k, v] of Object.entries(t)) {
    css += `    --${k}: ${v};\n`;
  }
  css += "  }\n\n";
}
css += "}\n";
fs.writeFileSync(path.join(__dirname, "styles", "themes.css"), css);
console.log("themes.css written");
