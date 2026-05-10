---
title: "Rust Docker Builds Under 3 Minutes: ZSTD Builders, Multi-Stage Pipelines, and Multi-Platform OCI Images"
author: nadzu
pubDatetime: 2026-05-10T15:39:19Z
slug: docker-cross-platform-build
featured: true
draft: false
tags:
  - Featured
  - multi-platform
  - multi-stage
  - Docker
  - Buildx
description: How I cut a bloated 2GB+ Rust Docker image and 10-minute build time down to under 3 minutes using BuildKit's ZSTD builder, cargo-chef caching, six-stage Dockerfiles, and OCI-compliant multi-platform manifests.
---


My Rust project was producing images over 2GB and build times crossing 10 minutes. It bundles static FFmpeg binaries, FFProbe, yt-dlp, and a compiled Rust binary, so the dependency surface is genuinely large. Every push to main felt like waiting for a compiler that had alzheimer's disease ;]. I overhauled the whole container pipeline, and the single biggest lever was setting a custom ZSTD builder as default. Here is what actually changed.

## Table of contents

## Why the legacy builder slowed everything down

The old Docker builder processed Dockerfiles line by line. Each step had to finish before the next one started. For a project with three completely independent build stages, that design serializes work that could run in parallel and wastes most of the cores on the machine, not to mention the **gzip** compression bottleneck during layer export.

BuildKit reads the entire Dockerfile first, maps out which stages depend on each other, and runs the independent ones at the same time. Stages that do not end up in the final image get dropped entirely. For this project that means the FFmpeg pull, the Python environment setup, and the Rust compilation all run concurrently instead of one after another.

## Why gzip slowed everything down

Gzip is single-threaded with no way around it in the standard implementation. During layer export, the pipeline stalls while one core compresses gigabytes of binary data regardless of how many cores the runner has.

Zstandard supports native multi-threading and a more efficient compression algorithm. After running the benchmarks myself:

> _"Perhaps the single most efficient compression option I have found in terms of compress/decompress time and space savings combined."_

| Metric                | gzip      | zstd     |
| --------------------- | --------- | -------- |
| Compress 5.18GB image | 163,014ms | 14,455ms |
| Final compressed size | 1.50GB    | 1.32GB   |
| Layer extraction time | 25,341ms  | 6,108ms  |

That extraction improvement directly cuts cold start time. In environments where every deployment pulls the image fresh, the gains hit both sides of the pipe.

> _"90% faster compression, smaller file, 60% faster to decompress. Both ends of the pipe."_

## Setting up the builder

The Makefile has a `builder` target that handles this:

```makefile
builder:
  docker buildx create --name zstd-builder --use
  docker buildx use zstd-builder
  docker buildx inspect --bootstrap
```

Running `make builder` once is enough. Every subsequent build call routes through the `zstd-builder` instance instead of the default driver.

- `make bd` (Makefile alias: local build) - loads a single-platform image into your local Docker daemon with zstd compression, fast iteration without a full push cycle
- `make bdp` (Makefile alias: production push) - builds for `linux/amd64`, compresses with zstd, pushes to the registry

## Six stages, not two

The common advice is "use multi-stage." My Dockerfile uses six stages, each doing exactly one thing:

1. **chef** - base build environment with compiler tooling
2. **planner** - reads the dependency manifest and generates a build recipe
3. **builder** - compiles only changed dependencies using cached build artifacts, then produces the final stripped binary
4. **ffmpeg** - pulls a static FFmpeg build, nothing else
5. **python-builder** - sets up the Python environment and installs the downloader tool
6. **runtime** - a minimal Alpine image that copies only the binary, FFmpeg, and the Python environment in

The final image has no compiler, no build artifacts, no source code. A 2GB+ build environment collapses into a deployment layer under 20MB, and zstd only has to compress that small remaining payload.

## Cache mounts, not the builder

The build time drop from 10 minutes to the 2 to 3 minute window comes almost entirely from three cache mounts in the builder stage:

```dockerfile
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/app/target \
    ...
```

On repeated builds, dependency compilation is skipped entirely if nothing in the dependency list changed. The compiler picks up from where the previous run stopped. Without these mounts, every CI run recompiles everything from scratch regardless of what actually changed.

The GitHub Actions workflow keeps these caches alive between runs:

```yaml
- uses: reproducible-containers/buildkit-cache-dance@v3.1.0
  with:
    cache-map: |
      {
        "app-target": "/app/target",
        "cargo-registry": "/usr/local/cargo/registry",
        "cargo-git": "/usr/local/cargo/git"
      }
```

Combined with `cache-from: type=gha` and `cache-to: type=gha,mode=max`, the runner inherits compiled artifacts from the previous workflow run. Current month stats: **2m 1s average job run time**, 0% failure rate.

## Local builds with `make`

The Makefile `c` target chains format check, type check, linter, and tests before anything runs:

```makefile
c:
  cargo fmt -- --check
  cargo check --locked
  cargo clippy --locked --all-targets --all-features -- -D warnings
  cargo test --locked --all-targets
```

The Makefile also detects available CPU cores automatically across Linux and macOS. For a shell alias that does the same:

```bash
alias m='make -j$(nproc 2>/dev/null || echo 4)'
```

`nproc` asks the kernel how many cores are available. The `2>/dev/null` suppresses errors on machines where the command does not exist, and the `|| echo 4` fallback assumes four cores as a safe baseline. Running `m` instead of `make` dispatches all checks concurrently across every available core.

## Picking the right compression level

BuildKit does not expose the full zstd compression range. It maps requested numbers into four internal tiers:

| Requested level | Behavior                               | Best for                               |
| --------------- | -------------------------------------- | -------------------------------------- |
| 0 to 2          | Fastest, larger files                  | Local iteration                        |
| 3 to 6          | Balanced                               | Standard CI pipelines                  |
| 7 to 8          | Slower, smaller files                  | When size matters more than build time |
| 9 to 22         | Maximum compression, identical above 9 | Minimum artifact size                  |

`compression-level=3` is the right call for CI. Anything above 9 produces the same output, so values like `compression-level=15` just add confusion. Also include `force-compression=true` if you have older cached layers around - without it, the builder imports them as-is instead of recompressing.

## Multi-platform builds and OCI media types

The `bdp` Makefile alias (production push) builds and emits a proper OCI manifest:

```makefile
docker buildx build \
  --builder zstd-builder \
  --platform linux/amd64 \
  --output type=image,name=$(IMAGE):$(TAG),push=$(PUSH),compression=zstd,oci-mediatypes=true \
  .
```

The `oci-mediatypes=true` flag is required. The legacy Docker manifest format has no definition for zstd-compressed layers. Without it, the builder either fails or pushes a manifest the registry cannot parse correctly.

The Dockerfile already handles ARM64 cross-compilation natively via a build argument that selects the correct compile target per architecture. Adding `linux/arm64` to the platform list handles it without any emulation overhead.

## Registry compatibility

| Registry                         | Zstd Support | Notes                                          |
| -------------------------------- | ------------ | ---------------------------------------------- |
| Docker Hub                       | Full         | Official Docker registry with full OCI support |
| GitHub Container Registry (GHCR) | Full         | Used in this repo's CI pipeline                |
| AWS ECR                          | Full         | Vulnerability scanning works on zstd layers    |
| Azure Container Registry         | Partial      | Requires newer node pool versions              |
| Google Artifact Registry         | Full         | Natively handles OCI formats                   |
| Fly.io Registry                  | Full         | Internal infrastructure optimized for zstd     |
| Harbor                           | Full         | Explicitly recommends zstd for large artifacts |
| DigitalOcean Container Registry  | Full         | Native support for OCI-compliant images        |

> Always validate registry support before pushing zstd images. A mismatch between the registry and the runtime daemon causes production cold start failures that will be traced back to compression layer incompatibility.
