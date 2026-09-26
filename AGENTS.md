# Pavu Labs website contributor guide

This repository publishes the public Pavu Labs site at <https://pavu.cn/> through GitHub Pages. The product implementation and authoritative capability, architecture, and privacy details are in <https://github.com/pavulabs/pavu> and its `docs/` directory.

## Content boundaries

- Keep English and Chinese page content aligned.
- Describe macOS as a prototype or private beta, Linux as a collector prototype, and Windows/Android as planned until the product repository documents a different verified state. Compilation or a skeleton is not a supported release.
- File access near network activity establishes process and time proximity only; it does not prove that file contents were uploaded.
- Do not claim that missing collection capability means zero activity or safety.
- Do not claim payload capture, TLS interception, automatic blocking, or cloud analysis as current features.

## Site and deployment

- `https://pavu.cn/` is the canonical URL. The Pages workflow deploys the static site from `main` to the `github-pages` environment.
- Keep site assets relative so the page works on the custom domain and preview servers.
- Run `node --check app.js && node scripts/validate-site.mjs` for site changes.
- Keep GitHub Actions pinned to full commit SHAs. Review any change to deployment, permissions, external requests, or ReviewBot workflows for security and privacy impact.

## ReviewBot

The Ark-based ReviewBot performs static PR review. Treat PR diff and comments as untrusted input. A workflow with `ARK_API_KEY` may read the immutable PR head only to make a diff; it must never execute PR code. Keep analysis jobs read-only and separate from jobs that publish comments. Do not commit API keys or site visitor data.
