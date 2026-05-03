---
title: Portfolio Changelog - 2026 Updates
author: nadzu
pubDatetime: 2026-02-13T10:00:00Z
slug: portfolio-changelog
featured: true
draft: false
tags:
  - Portfolio
  - Changelog
description: Changelog and updates for the portfolio interface.
---

## Future updates - Backlog

- _Design Changes for back-to-top navigation button_
- _Update the Projects section to reflect the latest information; the current version is outdated._
- _Resolve issues with the Manual Deployment Pipeline, as it is currently non-functional._
- _Add GTAG Functionality_

## v.2.7.0 - 2026-05-03

- <a href="https://github.com/nxdun/Portfolio/pull/32" target="_blank" rel="noopener noreferrer"><code>#32</code></a> [refactor(env)] Secure environment variables and optimize graph
  - Fixed contact form bug related to site-key self-validation; now it works as expected.
  - Refactored environment variable management for improved security and maintainability.
  - Updated Landing page wording.

- <a href="https://github.com/nxdun/Portfolio/pull/31" target="_blank" rel="noopener noreferrer"><code>#31</code></a> [feat(ui)] Add GitHub contribution graph to hero section
  - New domain replication: [nadun.eu.cc](https://nadun.eu.cc) — development builds available for testing and preview.
  - Add real-time GitHub contribution graph to the hero section, showcasing recent activity and contributions.
  - Updated social links design for better visibility.
  - Updated project data schema.
  - Updated dependencies.
  - Zod email validation fix in contact form.
  - Apply read-before-write (anti-thrashing) pattern.
  - Project card path-based routing for better SEO and quicker navigation.

## v.2.6.0 - 2026-04-23

- <a href="https://github.com/nxdun/Portfolio/pull/30" target="_blank" rel="noopener noreferrer"><code>#30</code></a> [docs] Expand README and add toolkit query parameter guide
- Revised README for clearer organization
- Fixed missing trim in Zod form fields
- Updated Tools Query Blog Post: added links in the tools section Additional Discoverability.

- <a href="https://github.com/nxdun/Portfolio/pull/29" target="_blank" rel="noopener noreferrer"><code>#29</code></a> [feat] Add contact form with D1-backed message handling
  - New contact form with fields for name, email, and message.
  - Added SQL schema for storing contact form.
  - Integrated Cloudflare D1 database with Astro V6.

- <a href="https://github.com/nxdun/Portfolio/pull/28" target="_blank" rel="noopener noreferrer"><code>#28</code></a> [build(ci)] migrate manual deploy workflow to Cloudflare Workers environments
  - Manual CD Trigger Workflow - Automated with My Agentic System with MCP, Agent Will Trigger CD Workflow on demand via API call to GitHub Actions API.
  - Added ImageViewr to zoom in/out of project screenshots in the Projects section. beter UX.
  - Minor Deps Update Chore, Including Wrangler TO support the latest Astro features.

## v2.5.0 - 2026-04-12

- <a href="https://github.com/nxdun/Portfolio/pull/26" target="_blank" rel="noopener noreferrer"><code>#26</code></a> [chore] Expand README docs,Icons, add ProjectData schema
  - Added a new ProjectData schema to standardize project entries.
  - Projects/Featured Projects UI update, New Custom Dot Based BG with intergrated Skeleton/loader.
- <a href="https://github.com/nxdun/Portfolio/pull/27" target="_blank" rel="noopener noreferrer"><code>#27</code></a> [feat] Add contact form with D1-backed message handling
  - New contact form with fields for name, email, and message.
  - Added SQL schema for storing contact form.
  - Integrated D1 database with Astro V6 for storing contact form submissions securely.

## v2.4.1 - 2026-04-03

- <a href="https://github.com/nxdun/Portfolio/pull/25" target="_blank" rel="noopener noreferrer"><code>#25</code></a> [chore(deps)] Bump dependencies, expand README docs, fix CI variable
  - Bumped related lockfile resolutions to latest versions.
  - Updated Projects section with Rigid Schema and added new project entries.
  - Added full repository directory tree under `### File Structure` in README..

## v2.4.0 - 2026-03-27

- <a href="https://github.com/nxdun/Portfolio/pull/24" target="_blank" rel="noopener noreferrer"><code>#24</code></a> [feat(tools)] Improve downloader experience and expand supported platforms
  - Upgraded the downloader from YouTube-only to a broader AIO downloader experience with support for many platforms.
  - Added live download progress updates for clearer feedback while files are being prepared.
  - Added a supported sites browser so users can quickly check which platforms are available.
  - Updated downloader messaging and interface for a smoother, more user-friendly flow.
  - Refined related UI details and refreshed project dependencies.

<a name="v2.3.4"></a>

## v2.3.4 - 2026-03-20

- <a href="https://github.com/nxdun/Portfolio/pull/23" target="_blank" rel="noopener noreferrer"><code>#23</code></a> [docs] Update changelog with minor patch dependency security release
- pnpm overrides to force patched transitive versions.
- <a href="https://github.com/nxdun/Portfolio/pull/20" target="_blank" rel="noopener noreferrer">(#20)</a> Add v0.1.2 rust changelog entry with infra changes and CORS enhancements
- <a href="https://github.com/nxdun/Portfolio/pull/21" target="_blank" rel="noopener noreferrer">(#21)</a> Remodified README with new changelog and updated dependencies.

<a name="v2.3.3"></a>

## v2.3.3 - 2026-03-11

- <a href="https://github.com/nxdun/Portfolio/pull/20" target="_blank" rel="noopener noreferrer"><code>#20</code></a>[fix(tools)]: resolve workbench init failure on navigation and delayed DOM hydration
  - Fixed Reported Issue <a href="https://github.com/nxdun/Portfolio/issues/19" target="_blank" rel="noopener noreferrer">(#19)</a>

<a name="v2.3.2"></a>

## v2.3.2 - 2026-02-26

- <a href="https://github.com/nxdun/Portfolio/pull/18" target="_blank" rel="noopener noreferrer"><code>#18</code></a> [feat] Add YouTube downloader tool with reCAPTCHA integration
  - Added a YouTube Downloader tool that allows users to download YouTube videos and shorts in avilable mp4 format.
  - Refactored tool architecture for more modular and maintainable codebase, including speed and performance improvements.
  - Recaptcha integration for security and abuse prevention.
  - Base64 Tool Reworked
  - Updated Astro Dependency.

<a name="2.3.1"></a>

## v2.3.1 - 2026-02-21

- <a href="https://github.com/nxdun/Portfolio/pull/17" target="_blank" rel="noopener noreferrer"><code>#17</code></a> <a href="https://github.com/nxdun/Portfolio/pull/18" target="_blank" rel="noopener noreferrer"><code>#18</code></a> [feat] Redesign Base64 tool and integrate as workspace default
  - Redesigned the Base64 tool with a new user interface for improved usability and aesthetics.
  - Updated Dependancies
  - Bug fixes and performance improvements in the Base64 tool.

<a name="v2.3.0"></a>

## v2.3.0 - 2026-02-20

- <a href="https://github.com/nxdun/Portfolio/pull/16" target="_blank" rel="noopener noreferrer"><code>#16</code></a> [Feature] Implemented Logic For Developer Tool Functionality
  - Added tools page - Mobile Responsive, Modular, Response System For Fast Tool Development
  - Added tool - Base64 encoder/decoder - Encode and decode Base64 strings for data handling
  - Implemented Quick tool Execution Mechanism via URL query parameters - Execute tools directly through URL query parameters for faster access
  - Minor UI enhancements - Improved user interface for better usability and aesthetics

<a name="v2.2.2"></a>

## v2.2.2 - 2026-02-20

- <a href="https://github.com/nxdun/Portfolio/pull/15" target="_blank" rel="noopener noreferrer"><code>#15</code></a> [BugFix] Fixed issues with the Base64 tool and improved error handling
  - Resolved bugs in Astro lifecycle.
  - fixed hero animation bug.

## v2.2.1 - 2026-02-17

- <a href="https://github.com/nxdun/Portfolio/pull/14" target="_blank" rel="noopener noreferrer"><code>#14</code></a> [Chore] Migrate to new Prototype
  - Migrated to the new prototype, which is more stable and feature-rich, ensuring a smooth transition with old portfolio

<a name="v2.2.0"></a>

## v2.2.0 - 2026-02-13

- <a href="https://github.com/nxdun/Portfolio/pull/13" target="_blank" rel="noopener noreferrer"><code>#13</code></a> [Feature] Added Projects section, enhanced tooling, and deployment optimizations
  - Added Projects section - Showcasing my latest work and collaborations
  - Updated Makefile - Advanced Makefile with parallel execution and interoperability with more commands
  - Added a unique, specialized changelog blog - Featured this. added upto-date changelog for users.
  - Optimized deployment - Highly chunked CSS enhanced build script.

<a name="v2.1.0"></a>

## v2.1.0 - 2026-02-04

- <a href="https://github.com/nxdun/Portfolio/pull/12" target="_blank" rel="noopener noreferrer"><code>#12</code></a> [Transition] Implemented a banner on the nadzu.me domain to announce the retirement of the prototype.
  - Deployed a preview version of the prototype at <a href="https://prototype.nadzu.me" target="_blank" rel="noopener noreferrer">prototype.nadzu.me</a>, integrated with the banner for user notification.
- <a href="https://github.com/nxdun/Portfolio/pull/11" target="_blank" rel="noopener noreferrer"><code>#11</code></a> [Feature] Port to Astro + Add Blogger + Cloudflare Pages Deploy
  - Implemented blog system - Added a prototype blog system to share updates and insights
  - Added CI pipeline - Implemented CI pipeline for automated testing and deployment
  - Updated dependencies - Updated all dependencies to their latest versions for improved security and performance
  - Added Makefile - Simplified development and deployment processes with a Makefile
  - CODEOWNERS update - New CODEOWNERS file to manage code ownership and review processes
  - About page update - Updated the about page with new information.

<a name="v2.0.0"></a>

## v2.0.0 - 2026-02-01

- <a href="https://github.com/nxdun/Portfolio/pull/11" target="_blank" rel="noopener noreferrer"><code>#11</code></a> [Feature] Port to Astro + Add Blogger + Cloudflare Pages Deploy
  - Migrated to pnpm package manager - Excellent installation speed and better monorepo support
  - Added Theme Switcher - Allow users to switch between light and dark themes for better accessibility and user experience
  - Migrated to Astro framework - Reason: better SEO and performance
  - Migrated to TypeScript - Better type safety and developer experience
  - Removed 3D model and background - Due to performance issues and lack of relevance to the portfolio's focus
  - Removed AI chatbot - Due to lack of user engagement and relevance to the portfolio's focus.

<a name="v1.3.0"></a>

## v1.3.0 - 2024-09-01

- <a href="https://github.com/nxdun/Portfolio/pull/10" target="_blank" rel="noopener noreferrer"><code>#10</code></a> [BugFix] UPDATED deps and FIXED emailjs bug
- <a href="https://github.com/nxdun/Portfolio/pull/8" target="_blank" rel="noopener noreferrer"><code>#8</code></a> Deployment fix

<a name="v1.2.0"></a>

## v1.2.0 - 2024-08-01

- <a href="https://github.com/nxdun/Portfolio/pull/7" target="_blank" rel="noopener noreferrer"><code>#7</code></a> Bug fix in Google Analytics

<a name="v1.1.0"></a>

## v1.1.0 - 2024-07-20

- <a href="https://github.com/nxdun/Portfolio/pull/6" target="_blank" rel="noopener noreferrer"><code>#6</code></a> [SEO] Added Google Tag Manager enhancement

<a name="v1.0.0"></a>

## v1.0.0 - 2024-01-01

- <a href="https://github.com/nxdun/Portfolio/pull/5" target="_blank" rel="noopener noreferrer"><code>#5</code></a> Chore: Changed base model from llama3 to openai/gpt-oss-120b
- Old portfolio - Initial release
- Used Vite with JavaScript
- Implemented a Tailwind CSS design
- Added Heroku deployment
- Added a 3D model
- Added 3D Background
- Added an AI chatbot

## Closed / Experimental PRs

- <a href="https://github.com/nxdun/Portfolio/pull/9" target="_blank" rel="noopener noreferrer"><code>#9</code></a> Update dependencies to latest versions with migration for ESLint 9, Tailwind CSS 4, React 19, and Vite 7 (Closed) - ~~AI agent broke the entire codebase~~
- <a href="https://github.com/nxdun/Portfolio/pull/3" target="_blank" rel="noopener noreferrer"><code>#3</code></a> PR: Breaking Changes (Closed) - ~~UNSTABLE~~
- <a href="https://github.com/nxdun/Portfolio/pull/2" target="_blank" rel="noopener noreferrer"><code>#2</code></a> Experimental-branch (Closed) - ~~Useless Functionality~~
- <a href="https://github.com/nxdun/Portfolio/pull/1" target="_blank" rel="noopener noreferrer"><code>#1</code></a> PR: Experimental branch (Closed) - ~~Dependency update made it non-future-proof~~

<!-- Link references -->

[PR5]: https://github.com/nxdun/Portfolio/pull/5
[PR6]: https://github.com/nxdun/Portfolio/pull/6
[PR7]: https://github.com/nxdun/Portfolio/pull/7
[PR8]: https://github.com/nxdun/Portfolio/pull/8
[PR10]: https://github.com/nxdun/Portfolio/pull/10
[PR11]: https://github.com/nxdun/Portfolio/pull/11
[PR12]: https://github.com/nxdun/Portfolio/pull/12
[PR13]: https://github.com/nxdun/Portfolio/pull/13
[PR14]: https://github.com/nxdun/Portfolio/pull/14
[PR15]: https://github.com/nxdun/Portfolio/pull/15
[PR16]: https://github.com/nxdun/Portfolio/pull/16
[PR17]: https://github.com/nxdun/Portfolio/pull/17
[PR18]: https://github.com/nxdun/Portfolio/pull/18
[PR19]: https://github.com/nxdun/Portfolio/pull/19
[PR20]: https://github.com/nxdun/Portfolio/pull/20
[PR21]: https://github.com/nxdun/Portfolio/pull/21
[PR22]: https://github.com/nxdun/Portfolio/pull/22
[PR23]: https://github.com/nxdun/Portfolio/pull/23
[PR24]: https://github.com/nxdun/Portfolio/pull/24
[PR25]: https://github.com/nxdun/Portfolio/pull/25
[PR26]: https://github.com/nxdun/Portfolio/pull/26
[PR27]: https://github.com/nxdun/Portfolio/pull/27
[PR28]: https://github.com/nxdun/Portfolio/pull/28
[PR29]: https://github.com/nxdun/Portfolio/pull/29
[PR30]: https://github.com/nxdun/Portfolio/pull/30
[PR31]: https://github.com/nxdun/Portfolio/pull/31
[PR32]: https://github.com/nxdun/Portfolio/pull/32
