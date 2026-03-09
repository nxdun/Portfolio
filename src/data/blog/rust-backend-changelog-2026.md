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

- _Separate CAPTCHA Verification endpoint_

## v0.1.0 - 2024-01-01

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
