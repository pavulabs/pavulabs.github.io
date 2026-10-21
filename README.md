# Pavu Labs website

Official website for Pavu Labs: [pavu.org](https://pavu.org/). This repository is a static site deployed by GitHub Pages from `main` through [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

Pavu is a local-first application security project for individuals. Its macOS prototype has real network activity and in-app findings. An observe-only Linux collector prototype exists, while Linux, Windows, and Android products are not yet available to users. Public access to the product source is being prepared.

Product implementation and current platform status live in the [Pavu repository](https://github.com/pavulabs/pavu).

## Domain and deployment

- The GitHub Pages custom domain is `pavu.org`; the repository's homepage is `https://pavu.org/`.
- DNS for `pavu.org` is on Cloudflare in DNS-only mode: the apex uses GitHub Pages' four `A` records and four `AAAA` records, and `www.pavu.org` is a `CNAME` to `pavulabs.github.io`. GitHub Pages redirects the `www` host to the apex domain when its certificate is ready.
- `pavu.cn` (also on Cloudflare) permanently redirects every path to the same path on `https://pavu.org/`.
- `pavu.org` is signed with DNSSEC: Cloudflare signs the zone and the matching DS record (key tag 2371, algorithm 13, digest type 2) is set at the registrar, Namecheap. Before moving the domain off Cloudflare's nameservers, turning DNSSEC off, or deleting and re-adding the zone, remove the DS record at Namecheap first and wait for it to expire from caches (about an hour); otherwise validating resolvers fail every lookup for the domain.
- Mail for `pavu.org` is iCloud+ (MX, SPF `include:icloud.com`, DKIM `sig1._domainkey`, DMARC `p=quarantine`). MTA-STS runs in `testing` mode: the policy is served at `https://mta-sts.pavu.org/.well-known/mta-sts.txt` by the Cloudflare Worker `pavu-mta-sts` and lists the iCloud MX hosts, and `_mta-sts` carries its id. TLS-RPT (`_smtp._tls`) sends reports to `wcai@pavu.org`. When the policy changes (for example to `mode: enforce`), update the Worker and change the `_mta-sts` id; when changing mail providers, update the policy's MX list before switching MX.
- GitHub Actions validates the static site, uploads it, and deploys it to the `github-pages` environment on pushes to `main`. Pull requests run the same validation without deploying.
- Run `node --check app.js && node scripts/validate-site.mjs && node --test scripts/test-app.mjs` locally before opening a pull request. No package installation or build step is needed.
- Check the [Pages settings](https://github.com/pavulabs/pavulabs.github.io/settings/pages) for certificate status. Enable **Enforce HTTPS** once GitHub finishes issuing the custom-domain certificate; GitHub does not allow this setting while issuance is pending.

The site is published with a custom GitHub Actions workflow. GitHub Pages stores the custom domain in repository settings; a `CNAME` file is not used by this deployment mode.

## Beta preview

Larger visual changes are published first at `https://pavu.org/beta/` for review. The `beta/` directory holds its own `index.html` and `styles.css` and reuses the root `app.js`, `favicon.svg` and `assets/` through relative `../` paths. The preview is marked `noindex`, keeps the root canonical URL, and is not listed in the sitemap. After the preview is approved, copy its page and styles to the root (restoring root-relative asset paths and removing the `noindex` tag) in a separate pull request.

## Search discovery

`robots.txt` allows crawling and points to `https://pavu.org/sitemap.xml`. The sitemap lists the site's only canonical page, `https://pavu.org/`. The language toggle and section anchors share this URL; they are not separate sitemap entries. Add future entries only when their canonical pages exist. Do not invent `lastmod` dates for unchanged content.

After an approved merge and deployment, verify that both files return HTTP 200, then submit `https://pavu.org/sitemap.xml` in the verified Google Search Console property and inspect the homepage URL. A submitted sitemap helps discovery but does not confirm indexing.

## ReviewBot

The Ark-based ReviewBot is shared in design with the [Pavu product repository](https://github.com/pavulabs/pavu/blob/main/docs/REVIEWBOT.en.md). It reviews each new commit of a non-draft, same-repository pull request and supports `@reviewbot review`, `@reviewbot recheck`, and `@reviewbot explain` from collaborators with write access. It produces advisory comments, never approvals or merges. Fork pull requests are skipped. Unlike the private product repository, it runs on GitHub-hosted runners: hosted minutes are free for this public repository, and no self-hosted runner is exposed to its pull requests. Temporary review input is deleted at the end of each job.

To enable it, add an **Agent Plan** API key as the repository Actions secret `ARK_API_KEY` in [Actions secrets](https://github.com/pavulabs/pavulabs.github.io/settings/secrets/actions). Optionally set repository variable `ARK_REVIEW_MODEL`; the default is `kimi-k3`. A normal pay-as-you-go Ark key is not interchangeable with the Agent Plan key. Without the secret, the automatic workflow exits with a notice and sends no code to Ark.

When enabled, the workflows send the trusted review prompts, base `AGENTS.md`, PR commit IDs and diff to the Volcengine Ark Agent Plan Responses API. Explicit commands also send the command text and comment context, and `recheck` may send prior ReviewBot output. The workflows do not receive site visitor data. Review output is stored in GitHub PR reviews or comments; Ark retention follows the account's data controls and terms. Remove `ARK_API_KEY` or disable the workflows to stop future requests.
