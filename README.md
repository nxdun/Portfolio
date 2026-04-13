<div align="center">
  <img src="./public/favicon.svg" alt="Portfolio Logo" width="130" />
  <h1><code>~/nadzu.me</code></h1>
  <p><em>Fast portfolio | blog | toolkit</em></p>

[![Old Release](https://img.shields.io/badge/Old%20Release-white.svg)](https://github.com/nxdun/Portfolio/tree/release/1.0.0)

</div>

---

# Features

Achives Perfect(100/100)

- [PageSpeed mobile scores](https://pagespeed.web.dev/analysis/https-nadzu-me/jvq4q0nv5q?form_factor=mobile)
- [PageSpeed Desktop scores](https://pagespeed.web.dev/analysis/https-nadzu-me/jvq4q0nv5q?form_factor=desktop).
  ![PageSpeed Insights](./public/PageSpeed%20Insights.png)

## Tooling Support

- **Quick Execution:** Launch tools via URL query params.

Built-in tools:

- [Base64 Encoder/Decoder](https://nadzu.me/tools/?tool=base64) Offline Base64 Encoder and decoder with a clean UI.

- [yt-dlp Downloader](https://nadzu.me/tools/?tool=ytdlp) Download from 1,700+ supported sites with reCAPTCHA protection.

# Development

## Tech Stack

| Layer          | Tool                                                   |
| -------------- | ------------------------------------------------------ |
| **Framework**  | [Astro](https://astro.build/) [pnpm](https://pnpm.io/) |
| **Language**   | [TypeScript](https://www.typescriptlang.org/)          |
| **Styling**    | [TailwindCSS](https://tailwindcss.com/)                |
| **Search**     | [Pagefind](https://pagefind.app/)                      |
| **Icons**      | [Icones](https://icones.js.org/)                       |
| **Formatting** | [Prettier](https://prettier.io/)                       |
| **Linting**    | [ESLint](https://eslint.org)                           |
| **Deployment** | [Cloudflare workers](https://workers.cloudflare.com/)  |

---

## Running Locally

> Requires `make`. Install it first if you haven't: Check MakeFile for available commands.

```bash
# macOS
brew install make

# Windows
choco install make
```

### File Structure

<details>
<summary>Directory Structure (overall)</summary>

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
|-- public
|   |-- PageSpeed Insights.png
|   |-- favicon.svg
|   |-- nadzu-og-2.jpg
|   |-- nadzu-og-3.jpg
|   `-- nadzu-og.jpg
|-- src
|   |-- actions
|   |   `-- index.ts
|   |-- assets
|   |   |-- icons
|   |   |   |-- IcoGithub.svg
|   |   |   |-- IcoInstagram.svg
|   |   |   |-- IcoLinkedin.svg
|   |   |   |-- IcoMail.svg
|   |   |   |-- IcoTelegram.svg
|   |   |   |-- IcoWhatsaspp.svg
|   |   |   |-- IconArchive.svg
|   |   |   |-- IconArrowLeft.svg
|   |   |   |-- IconArrowNarrowUp.svg
|   |   |   |-- IconArrowRight.svg
|   |   |   |-- IconBrandX.svg
|   |   |   |-- IconCalendar.svg
|   |   |   |-- IconChevronLeft.svg
|   |   |   |-- IconChevronRight.svg
|   |   |   |-- IconClear.svg
|   |   |   |-- IconCopy.svg
|   |   |   |-- IconEdit.svg
|   |   |   |-- IconFacebook.svg
|   |   |   |-- IconGitHub.svg
|   |   |   |-- IconHash.svg
|   |   |   |-- IconLinkedin.svg
|   |   |   |-- IconMail.svg
|   |   |   |-- IconMaximize.svg
|   |   |   |-- IconMenuDeep.svg
|   |   |   |-- IconMinimize.svg
|   |   |   |-- IconMoon.svg
|   |   |   |-- IconNuuLinkedIn.svg
|   |   |   |-- IconPaste.svg
|   |   |   |-- IconPinterest.svg
|   |   |   |-- IconRss.svg
|   |   |   |-- IconSearch.svg
|   |   |   |-- IconSunHigh.svg
|   |   |   |-- IconSwap.svg
|   |   |   |-- IconTelegram.svg
|   |   |   |-- IconWhatsapp.svg
|   |   |   |-- IconX.svg
|   |   |   `-- LoaderPacman.svg
|   |   `-- tags
|   |       |-- IconApacheFelix.svg
|   |       |-- IconCloudFlare.svg
|   |       |-- IconCsharp.svg
|   |       |-- IconCss.svg
|   |       |-- IconDocker.svg
|   |       |-- IconDotNet.svg
|   |       |-- IconEclipse.svg
|   |       |-- IconExpress.svg
|   |       |-- IconFigma.svg
|   |       |-- IconFlask.svg
|   |       |-- IconGitlab.svg
|   |       |-- IconGlobe.svg
|   |       |-- IconHeroku.svg
|   |       |-- IconJava.svg
|   |       |-- IconKubernetes.svg
|   |       |-- IconMongodb.svg
|   |       |-- IconNetlify.svg
|   |       |-- IconPhp.svg
|   |       |-- IconReact.svg
|   |       |-- IconRedux.svg
|   |       |-- IconResearch.svg
|   |       |-- IconSpringBoot.svg
|   |       |-- IconSql.svg
|   |       |-- IconTailwind.svg
|   |       |-- IconTerraform.svg
|   |       |-- IconThreejs.svg
|   |       |-- IconTomcat.svg
|   |       `-- IconYoutube.svg
|   |-- components
|   |   |-- BackButton.astro
|   |   |-- BackToTopButton.astro
|   |   |-- Breadcrumb.astro
|   |   |-- Card.astro
|   |   |-- ContactMe.astro
|   |   |-- Datetime.astro
|   |   |-- EditPost.astro
|   |   |-- Footer.astro
|   |   |-- Header.astro
|   |   |-- ImageViewer.astro
|   |   |-- LinkButton.astro
|   |   |-- Loader.astro
|   |   |-- Pagination.astro
|   |   |-- ProjectCard.astro
|   |   |-- ProjectDialog.astro
|   |   |-- ShareLinks.astro
|   |   |-- Socials.astro
|   |   |-- Tag.astro
|   |   `-- tools
|   |       `-- RecaptchaConfig.astro
|   |-- config.ts
|   |-- constants.ts
|   |-- content.config.ts
|   |-- data
|   |   |-- blog
|   |   |   |-- docker-build-post.md
|   |   |   |-- examples
|   |   |   |   |-- example-draft-post.md
|   |   |   |   |-- example-featured-post.md
|   |   |   |   `-- example-non-draft-non-featured-post.md
|   |   |   |-- portfolio-changelog-2026.md
|   |   |   `-- rust-backend-changelog-2026.md
|   |   |-- form
|   |   |   `-- schema.sql
|   |   `-- projects
|   |       |-- ProjectData.json
|   |       `-- ProjectData.schema.json
|   |-- env.d.ts
|   |-- layouts
|   |   |-- AboutLayout.astro
|   |   |-- Layout.astro
|   |   |-- Main.astro
|   |   |-- PostDetails.astro
|   |   `-- ToolsLayout.astro
|   |-- pages
|   |   |-- 404.astro
|   |   |-- about.md
|   |   |-- api
|   |   |   `-- health.ts
|   |   |-- archives
|   |   |   `-- index.astro
|   |   |-- index.astro
|   |   |-- og.png.ts
|   |   |-- posts
|   |   |   |-- [...page].astro
|   |   |   `-- [...slug]
|   |   |       |-- index.astro
|   |   |       `-- index.png.ts
|   |   |-- projects
|   |   |   `-- index.astro
|   |   |-- robots.txt.ts
|   |   |-- rss.xml.ts
|   |   |-- search.astro
|   |   |-- tags
|   |   |   |-- [tag]
|   |   |   |   `-- [...page].astro
|   |   |   `-- index.astro
|   |   `-- tools
|   |       `-- index.astro
|   |-- remark-collapse.d.ts
|   |-- scripts
|   |   |-- theme.ts
|   |   `-- tools
|   |       |-- base64
|   |       |   |-- controller.ts
|   |       |   |-- dom.ts
|   |       |   |-- index.ts
|   |       |   |-- template.ts
|   |       |   |-- uiController.ts
|   |       |   |-- urlOptions.ts
|   |       |   `-- validation.ts
|   |       |-- catalog.ts
|   |       |-- clipboard.ts
|   |       |-- registry.ts
|   |       |-- types.ts
|   |       |-- ui
|   |       |   |-- captchaDialog.ts
|   |       |   |-- progressBar.ts
|   |       |   `-- responseDock.ts
|   |       |-- validation.ts
|   |       |-- workbench.ts
|   |       `-- ytdlp
|   |           |-- apiClient.ts
|   |           |-- controller.ts
|   |           |-- dom.ts
|   |           |-- index.ts
|   |           |-- jobMonitor.ts
|   |           |-- sitesController.ts
|   |           |-- template.ts
|   |           |-- uiController.ts
|   |           |-- urlOptions.ts
|   |           `-- validation.ts
|   |-- styles
|   |   |-- global.css
|   |   `-- typography.css
|   `-- utils
|       |-- CoreApiClient.ts
|       |-- asyncPoll.ts
|       |-- base64.ts
|       |-- captchaManager.ts
|       |-- generateOgImages.ts
|       |-- getPath.ts
|       |-- getPostsByGroupCondition.ts
|       |-- getPostsByTag.ts
|       |-- getSortedPosts.ts
|       |-- getUniqueTags.ts
|       |-- loadGoogleFont.ts
|       |-- og-templates
|       |   |-- post.js
|       |   `-- site.js
|       |-- postFilter.ts
|       |-- projectUtils.ts
|       |-- slugify.ts
|       |-- transformers
|       |   `-- fileName.js
|       |-- typingAnimation.ts
|       |-- ytdlpProgress.ts
|       `-- ytdlpStatus.ts
|-- tsconfig.json
`-- wrangler.jsonc
```

</details>

### notes

- Disable Cloudflare's rocket loader permanently. [#19](https://github.com/nxdun/Portfolio/issues/19)
- Run `npx astro telemetry disable` to disable Astro's telemetry on your machine.
