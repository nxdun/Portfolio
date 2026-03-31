---
title: Nadzu Backend Changelog - 2026 Updates
author: nadzu
pubDatetime: 2026-03-09T10:00:00Z
slug: rust-backend-changelog
featured: true
draft: false
tags:
  - Rust
  - Backend
  - Changelog
description: A comprehensive nadzu.me Rust Backend Changelog documenting updates for humans
---

## Future updates - Backlog

- _Redis Intergration for Caching and Pub/Sub_
- _Add OpenGraph API Intergration and Map it with Postman_

## v.0.3.0 - 2026-03-31

- <a href="https://github.com/nxdun/rust-codebase/pull/9" target="_blank"><code>#9</code></a>[feat(infra)] Tiered rate limiting, Caddy file server, and expanded test suite
  - Yt Download Support Removed Due to DMCA Sorry ;[
  - Added API Key Support With Tiered Rate Limiting (free vs. premium).
  - Added Production Caddyfile with Personal File Server + Reverse Proxy.
  - Infrastructure Fully Parameterized with Environment Variables and Config Files.
  - Test Cases Are More Rigorous and Cover Edge Cases.
  - Postman Collection is More Structured With Up to Date Seperation and Usage of environment variables.

## v0.2.0 - 2026-03-27

- <a href="https://github.com/nxdun/rust-codebase/pull/8" target="_blank"><code>#8</code></a>[feat(ytdlp)] Add streaming progress and supported sites API
  - SSE endpoint for live yt-dlp job download progress updates.
  - Added supported sites endpoint listing all available download platforms.
  - Replaced bgutil/POT provider with `aria2c` for faster multi-connection downloading.
  - Introduced `MASTER_API_KEY` auth middleware; replaces dev bypass header.
  - **Breaking:** `YTDLP_COOKIES_FILE`, `YTDLP_POT_PROVIDER_URL`, and `YTDLP_PRESIGNED_URL` env vars removed. YouTube Shorts URL normalization removed.

## v0.1.3 - 2026-03-22

- <a href="https://github.com/nxdun/rust-codebase/pull/7" target="_blank"><code>#7</code></a>[feat(infra)] Add dev environment and refactor yt-dlp selector
  - Added local Docker Compose stack (`Dockerfile.dev`, `Caddy`, `cargo-watch`).
  - [#6](https://github.com/nxdun/rust-codebase/issues/6). Fixed `yt-dlp` format and sort flag logic for better media extraction.
  - Streamlined Makefile targets and secured `.dockerignore`.

## v0.1.2 - 2024-03-17

- <a href="https://github.com/nxdun/rust-codebase/pull/5" target="_blank"><code>#5</code></a>[infra] Add Cloudflare DNS integration and wildcard CORS
  - Implemented Cloudflare DNS management (`api.nadzu.me`) and IP-restricted DigitalOcean firewall.
  - Added HTTPS support via Caddy reverse proxy with automated TLS certificate provisioning.
  - Migrated WARP proxy to custom [nxdun/docker-warp-proxy](https://github.com/nxdun/docker-warp-proxy) image, adding WARP+ license key support, container hardening (`NET_ADMIN`), and `NO_PROXY` routing rules.
  - Enhanced Rust CORS middleware to safely support wildcard origins using pre-computed matchers.
  - Updated CI/CD workflows (Actions v4/v5) and added an isolated `tft` testing target in Makefile.

## v0.1.1 - 2024-03-12

- <a href="https://github.com/nxdun/rust-codebase/pull/4" target="_blank"><code>#4</code></a>[feat(core)] Add build caching and SOCKS proxy support
  - Add GitHub Actions caching layer, improving build speed by over 440%.
  - Updated DockerImage With Fixed Issues and Optimized Caching.
  - Added Cloudflare WARP Tunnel For Outbound Requests.
    - Implement SOCKS proxy support.
  - Production Infrastructure Run on Docker Compose with WARP Tunnel for outbound traffic.
  - ENFORCED Capital ENV Variable Names for Interoperability.

## v0.1.0 - 2024-03-01

- <a href="https://github.com/nxdun/rust-codebase/pull/3" target="_blank"><code>#3</code></a>[DevOps] Add GHCR publishing and DigitalOcean Terraform infrastructure
  - Complete CI Validation per Commit
  - CD workflow for GHCR publishing
  - Terraform configuration for DigitalOcean infrastructure with Cloudflare R2 Backend.
  - Secure Secret Management for GHCR and Terraform deployments.
  - Makefile Implementation.

## v0.0.2 - 2026-02-23

- <a href="https://github.com/nxdun/rust-codebase/pull/2" target="_blank"><code>#2</code></a>[Feat] Add Google reCAPTCHA verification endpoint
  - Middleware to verify Google reCAPTCHA responses.
  - Redesigned API structure for better organization and scalability.
  - Postman collection updates for new endpoint testing and documentation.
  - Implemented Redis with Postgres for caching and data storage.

## v0.0.1 - 2026-02-18

- <a href="https://github.com/nxdun/rust-codebase/pull/1" target="_blank"><code>#1</code></a>[Feature] Initial Rust backend API server setup with Axum framework
  - Rust Core API Server Setup - axum, tokio, tower, serde
  - Single Stage Dockerfile for containerization
  - Basic API Endpoint - /api/hello returning "Hello, World!" for testing and validation

## Closed / Experimental PRs

- none
