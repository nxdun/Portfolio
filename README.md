<div align="center">
  <img src="./public/favicon.svg" alt="Portfolio Logo" width="130" />
  <h1><code>~/nadzu.me</code></h1>
  <p><em>Fast by default. Useful by design.</em></p>

[![Old Release](https://img.shields.io/badge/Old%20Release-grey.svg)](https://github.com/nxdun/Portfolio/tree/release/1.0.0) [![Changelog](https://img.shields.io/badge/Changelog-grey.svg)](https://nadzu.me/changelog) [![Backend Repo Rust](https://img.shields.io/badge/Backend%20Repo-Rust-orange.svg)](https://github.com/nxdun/rust-codebase/pulls)

</div>

---

> [!TIP]
> Backup Domain (Development/Preview Builds): [nadun.eu.cc](https://nadun.eu.cc)

# Features

<div align="center">
  <p><strong>Achieves a perfect PageSpeed score (100/100).</strong></p>
  <p>
    <a href="https://pagespeed.web.dev/analysis/https-nadzu-me/jvq4q0nv5q?form_factor=mobile">Mobile score</a> ·
    <a href="https://pagespeed.web.dev/analysis/https-nadzu-me/jvq4q0nv5q?form_factor=desktop">Desktop score</a>
  </p>
  <img src="./public/PageSpeed%20Insights.png" alt="PageSpeed Insights" style="max-width: 100%; height: auto; display: block; margin: 1rem 0;" />
</div>

A personal site that doubles as a blog platform and Additioonal Awsome tools. Built fast. Kept useful.

- Static-first architecture via Astro with zero client-side JS by default
- Full-text search powered by Pagefind with no external search service required
- Auto-generated Open Graph images per post and site-wide
- RSS feed for automation `/rss.xml`, robots configuration at `/robots.txt`
- Health check endpoint at `/api/health`
- Tag-based post grouping with paginated archive

- CI pipleines For Linting / Formatting and Build
- CD pipelines for Deploying into Cloudflare Workers

## Toolkit

Quick-launch browser tools accessible directly via URL query parameters. No install, no sign-in.
Refer Developer Documentation at :
| Tool | URL | Description |
| ----------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| Base64 | [`/tools/?tool=base64`](https://nadzu.me/tools/?tool=base64) | Offline Base64 encoder and decoder with a clean UI |
| yt-dlp Downloader | [`/tools/?tool=ytdlp`](https://nadzu.me/tools/?tool=ytdlp) | Download from 1,700+ supported sites with reCAPTCHA protection |

---

# Development

## Tech Stack

<div align="center">

| Layer      | Choice                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Framework  | [Astro](https://astro.build/) + [pnpm](https://pnpm.io/)                                                     |
| Language   | [TypeScript](https://www.typescriptlang.org/)                                                                |
| Styling    | [TailwindCSS](https://tailwindcss.com/)                                                                      |
| Search     | [Pagefind](https://pagefind.app/)                                                                            |
| Icons      | [Icones](https://icones.js.org/)                                                                             |
| Formatting | [Prettier](https://prettier.io/)                                                                             |
| Linting    | [ESLint](https://eslint.org)                                                                                 |
| Deployment | [Cloudflare Workers](https://workers.cloudflare.com/) [Cloudflare KV](https://developers.cloudflare.com/kv/) |

</div>

## Running Locally

Requires `make`. Install it first if not already present, then use `make help` to list all available targets.

```bash
# macOS
brew install make

# Windows
choco install make
```

Once `make` is available:

```bash
make install   # install dependencies via pnpm
make dev       # start local dev server
make build     # production build
make preview   # preview the production build locally
```

<details>
<summary>All available Make targets</summary>

| Target         | Alias | Description                                       |
| -------------- | ----- | ------------------------------------------------- |
| `install`      | `i`   | Install dependencies via pnpm                     |
| `dev`          |       | Start dev server                                  |
| `build`        |       | Production build                                  |
| `preview`      |       | Preview the built output                          |
| `check`        | `c`   | Run lint and format-check in parallel             |
| `format`       | `f`   | Format code via Prettier                          |
| `format-check` |       | Check formatting without writing                  |
| `lint`         |       | Lint via ESLint                                   |
| `sync`         |       | Sync Astro types                                  |
| `deploy`       |       | Deploy to Cloudflare (requires `production=true`) |
| `d-p`          |       | Deploy to Cloudflare preview branch               |
| `clean`        |       | Remove dist, node_modules, and build artifacts    |

</details>

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values before running locally.

```bash
cp .env.example .env
```

## File Structure

<details>
<summary>Full directory tree</summary>

```text
.
|-- Dockerfile
|-- LICENSE
|-- Makefile
|-- README.md
|-- astro.config.ts
|-- cz.yaml
|-- docker-compose.yml
|-- eslint.config.js
|-- package.json
|-- pnpm-lock.yaml
|-- pnpm-workspace.yaml
|-- public/
|   |-- PageSpeed Insights.png
|   |-- favicon.svg
|   `-- nadzu-og*.jpg
|-- src/
|   |-- actions/         # Astro server actions
|   |-- assets/          # SVG icons (ui + tech tags)
|   |-- components/      # Reusable Astro components
|   |-- data/
|   |   |-- blog/        # Markdown blog posts
|   |   |-- form/        # Contact form schema
|   |   `-- projects/    # ProjectData.json + schema
|   |-- layouts/         # Page layout wrappers
|   |-- pages/           # File-based routing
|   |-- scripts/
|   |   |-- theme.ts
|   |   `-- tools/       # Tool-specific TS modules (base64, ytdlp)
|   |-- styles/          # Global CSS and typography
|   `-- utils/           # Helpers: OG gen, slug, post filters, etc.
|-- tsconfig.json
`-- wrangler.jsonc
```

</details>

<!-- <details>
<summary>Key source paths explained</summary>

- `src/pages/` maps every `.astro` or `.md` file directly to a URL via file-based routing.
- `src/data/projects/ProjectData.json` is the single source of truth for all project cards on the site.
- `src/scripts/tools/` isolates each tool (base64, ytdlp) into its own module set: controller, dom, template, validation, urlOptions, uiController.
- `src/utils/` holds shared utilities including OG image generation, post sorting and filtering, slug helpers, and the `CoreApiClient` used by the yt-dlp tool.
- `wrangler.jsonc` holds the Cloudflare Workers deployment config for both production and preview environments.

</details> -->

---

## Docker

A `Dockerfile` and `docker-compose.yml` are included for containerized local development or self-hosting.

```bash
docker compose up
```

The `.dockerignore` excludes `node_modules`, `dist`, and other non-essential paths from the image context.

---

## Notes

- Disable Cloudflare Rocket Loader permanently. It interferes with client-side scripts. See [#19](https://github.com/nxdun/Portfolio/issues/19).
- Run `npx astro telemetry disable` once after cloning to opt out of Astro anonymous usage telemetry on your machine.
- Commitizen is configured via `cz.yaml` for consistent conventional commit messages.

---

## License

[MIT](./LICENSE)
