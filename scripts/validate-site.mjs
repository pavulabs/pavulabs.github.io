import { access, readFile } from "node:fs/promises";

const html = await readFile("index.html", "utf8");
const canonicalUrl = "https://pavu.org/";
if (/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html)) {
  throw new Error("The production homepage must not inherit beta's noindex directive.");
}
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
  "index.html.md",
  "license.js",
  "llms.txt",
  "product-license.html",
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

// The beta preview must stay out of search results and resolve its relative
// references from its own directory.
const betaHtml = await readFile("beta/index.html", "utf8");
if (!betaHtml.includes('<meta name="robots" content="noindex" />')) {
  throw new Error("The beta preview must be marked noindex.");
}
for (const [, reference] of betaHtml.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if (/^(#|https?:\/\/|mailto:)/.test(reference)) {
    continue;
  }
  await access(`beta/${reference.split(/[?#]/, 1)[0]}`);
}

// The license page resolves its relative references and in-page anchors on its own.
const licenseHtml = await readFile("product-license.html", "utf8");
for (const [, reference] of licenseHtml.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if (/^(#|https?:\/\/|mailto:|\.\/$)/.test(reference)) {
    continue;
  }
  await access(reference.split(/[?#]/, 1)[0]);
}
const licenseIds = new Set([...licenseHtml.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
for (const [, anchor] of licenseHtml.matchAll(/href="#([^"]+)"/g)) {
  if (!licenseIds.has(anchor)) {
    throw new Error(`Missing license page anchor target: #${anchor}`);
  }
}

// Keep the LLM-facing documents discoverable and their download links current.
if (
  !html.includes('<link rel="describedby" type="text/plain" href="llms.txt" />') ||
  !html.includes('<link rel="alternate" type="text/markdown" href="index.html.md" />') ||
  !licenseHtml.includes('<link rel="describedby" type="text/plain" href="llms.txt" />')
) {
  throw new Error("Public pages must advertise the LLM index and Markdown guide.");
}
const installer = html.match(/href="(downloads\/Pavu-[^"]+\.dmg)"/)?.[1];
if (!installer) {
  throw new Error("The homepage's current macOS installer link is missing.");
}
for (const document of ["llms.txt", "index.html.md"]) {
  const markdown = await readFile(document, "utf8");
  if (
    !markdown.startsWith("# Pavu\n") &&
    !markdown.startsWith("# Pavu App\n")
  ) {
    throw new Error(`${document} must identify Pavu in its first heading.`);
  }
  if (
    !markdown.includes(`](${canonicalUrl}${installer})`) ||
    !markdown.includes(`](${canonicalUrl}${installer}.sha256)`)
  ) {
    throw new Error(`${document} must link to the homepage's current installer and checksum.`);
  }
  for (const [, reference] of markdown.matchAll(/\[[^\]]+\]\((https:\/\/[^\s)]+)\)/g)) {
    const url = new URL(reference);
    if (url.origin !== new URL(canonicalUrl).origin) {
      continue;
    }
    const path = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
    if (path.split("/").includes("..")) {
      throw new Error(`Invalid Markdown link path in ${document}.`);
    }
    await access(path);
    if (url.hash && path.endsWith(".html")) {
      const target = await readFile(path, "utf8");
      const anchor = decodeURIComponent(url.hash.slice(1));
      if (!target.includes(`id="${anchor}"`)) {
        throw new Error(`Missing Markdown link anchor: ${reference}`);
      }
    }
  }
}

console.log("Static site validation passed.");
