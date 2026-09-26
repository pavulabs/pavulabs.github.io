# Pavu Labs website

Official website for Pavu Labs: [pavu.cn](https://pavu.cn/). This repository is a static site deployed by GitHub Pages from `main` through [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

Pavu is a local-first application security project for individuals. Its macOS prototype has real network activity and in-app findings. An observe-only Linux collector prototype exists, while Linux, Windows, and Android products are not yet available to users. Public access to the product source is being prepared.

Product implementation and current platform status live in the [Pavu repository](https://github.com/pavulabs/pavu).

## Domain and deployment

- The GitHub Pages custom domain is `pavu.cn`; the repository's homepage is `https://pavu.cn/`.
- Preview changes on the separate [Pavu beta site](https://pavu.cn/126b60f0c16bd022fb83a913e1b83cd0/) ([source repository](https://github.com/pavulabs/126b60f0c16bd022fb83a913e1b83cd0)) before publishing them here.
- DNS for the apex domain uses GitHub Pages' four `A` records and four `AAAA` records. `www.pavu.cn` is a `CNAME` to `pavulabs.github.io`. GitHub Pages redirects the `www` host to the apex domain when its certificate is ready.
- GitHub Actions validates the static site, uploads it, and deploys it to the `github-pages` environment on pushes to `main`. Pull requests run the same validation without deploying.
- The `github-pages` environment requires explicit approval from `caiwl` before a production deployment proceeds. The repository has auto-merge disabled. The owner approval workflow records a successful commit status only after `caiwl` comments `/approve-production FULL_40_CHARACTER_HEAD_SHA` on the PR; a new push requires a new approval. Add `Owner publication approval` as a required branch protection status once this workflow is on `main`.
- Deployment can only be triggered by a push to `main`; the manual workflow dispatch entry point is disabled.
- Run `node --check app.js && node scripts/validate-site.mjs` locally before opening a pull request. No package installation or build step is needed.
- Check the [Pages settings](https://github.com/pavulabs/pavulabs.github.io/settings/pages) for certificate status. Enable **Enforce HTTPS** once GitHub finishes issuing the custom-domain certificate; GitHub does not allow this setting while issuance is pending.

The site is published with a custom GitHub Actions workflow. GitHub Pages stores the custom domain in repository settings; a `CNAME` file is not used by this deployment mode.

## ReviewBot

The Ark-based ReviewBot is shared in design with the [Pavu product repository](https://github.com/pavulabs/pavu/blob/main/docs/REVIEWBOT.en.md). It reviews each new commit of a non-draft, same-repository pull request and supports `@reviewbot review`, `@reviewbot recheck`, and `@reviewbot explain` from collaborators with write access. It produces advisory comments, never approvals or merges. Fork pull requests are skipped.

To enable it, add an **Agent Plan** API key as the repository Actions secret `ARK_API_KEY` in [Actions secrets](https://github.com/pavulabs/pavulabs.github.io/settings/secrets/actions). Optionally set repository variable `ARK_REVIEW_MODEL`; the default is `kimi-k3`. A normal pay-as-you-go Ark key is not interchangeable with the Agent Plan key. Without the secret, the automatic workflow exits with a notice and sends no code to Ark.

When enabled, the workflows send the trusted review prompts, base `AGENTS.md`, PR commit IDs and diff to the Volcengine Ark Agent Plan Responses API. Explicit commands also send the command text and comment context, and `recheck` may send prior ReviewBot output. The workflows do not receive site visitor data. Review output is stored in GitHub PR reviews or comments; Ark retention follows the account's data controls and terms. Remove `ARK_API_KEY` or disable the workflows to stop future requests.
