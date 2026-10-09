import { access, readFile } from "node:fs/promises";

const html = await readFile("index.html", "utf8");
const canonicalUrl = "https://pavu.cn/";
if (!html.includes(`<link rel="canonical" href="${canonicalUrl}" />`)) {
  throw new Error(`Expected canonical URL: ${canonicalUrl}`);
}
if (!html.includes(`<meta property="og:url" content="${canonicalUrl}" />`)) {
  throw new Error(`Expected Open Graph URL: ${canonicalUrl}`);
}
const requiredFiles = [
  ".nojekyll",
  "app.js",
  "assets/pavu-icon.png",
  "favicon.svg",
  "index.html",
  "robots.txt",
  "sitemap.xml",
  "styles.css",
];

for (const file of requiredFiles) {
  await access(file);
}

// This single-page site intentionally has one sitemap entry. Validate its
// complete XML shape, not just the presence of a canonical URL somewhere in it.
const sitemap = await readFile("sitemap.xml", "utf8");
const sitemapMatch = sitemap.match(
  /^\s*<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">\s*<url>\s*<loc>([^<]+)<\/loc>\s*<\/url>\s*<\/urlset>\s*$/,
);
if (!sitemapMatch || sitemapMatch[1] !== canonicalUrl) {
  throw new Error("Expected a valid single-page sitemap matching the canonical URL.");
}

// Keep the policy deliberately small: one wildcard group allowing all paths,
// and one absolute sitemap directive. Reject extra groups or blocking rules.
const robots = (await readFile("robots.txt", "utf8"))
  .split(/\r?\n/)
  .map((line) => line.split("#", 1)[0].trim())
  .filter(Boolean);
if (
  robots.length !== 3 ||
  !/^User-agent:\s*\*$/i.test(robots[0]) ||
  !/^Allow:\s*\/$/i.test(robots[1]) ||
  robots[2].replace(/^Sitemap:\s*/i, "") !== `${canonicalUrl}sitemap.xml` ||
  !/^Sitemap:/i.test(robots[2])
) {
  throw new Error("Expected robots.txt to allow all crawlers and advertise the canonical sitemap.");
}

for (const attribute of ["href", "src"]) {
  const pattern = new RegExp(`${attribute}="([^"]+)"`, "g");
  for (const [, reference] of html.matchAll(pattern)) {
    if (
      reference.startsWith("#") ||
      reference.startsWith("https://") ||
      reference.startsWith("http://") ||
      reference.startsWith("mailto:")
    ) {
      continue;
    }

    const path = reference.split(/[?#]/, 1)[0];
    await access(path);
  }
}

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.has(anchor)) {
    throw new Error(`Missing anchor target: #${anchor}`);
  }
}

if (!html.includes("data-en=") || !html.includes("data-zh=")) {
  throw new Error("Bilingual content markers are missing.");
}

console.log("Static site validation passed.");
