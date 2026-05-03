---
title: "Cross-Platform Docker: Building for x86 and ARM"
author: nadzu
pubDatetime: 2026-03-31T15:39:19Z
slug: docker-cross-platform-build
featured: true
draft: false
tags:
  - Featured
  - multi-platform
  - Docker
  - Buildx
description: A guide on building multi-platform Docker images across CPU architectures like x86 and ARM using Docker buildx and QEMU.
---

## Preface

Running programs on different CPU architectures (like running software on a Raspberry Pi) is common. Docker makes deploying applications on ARM devices easier by hiding system differences.

Building multi-platform Docker images used to be difficult. You had to build on different CPU architectures directly, use virtualization to simulate architectures, and manually merge image manifests. Docker 19.03 introduced `buildx`, a plugin that simplifies cross-platform image building.

## Methods for Compiling Across CPU Architectures

Here are the primary methods for compiling programs for different CPU architectures.

### Method 1: Compile Directly on Target Hardware

If you have access to the target architecture, you can compile natively. For Docker, this means installing Docker on a Raspberry Pi and building the ARM image directly using a Dockerfile.

### Method 2: Simulate Target Hardware

Emulators let you build programs across architectures. QEMU is a popular open-source emulator supporting ARM, Power-PC, and RISC-V. By simulating a full operating system, you can boot Linux in an ARM virtual machine and compile your program. However, simulating hardware like timers and memory controllers is resource-intensive and unnecessary for compilation.

### Method 3: Simulate Target User Space

On Linux, QEMU offers a user-state mode. It uses `binfmt_misc` to register a binary conversion handler in the Linux kernel. This translates binaries dynamically during execution, converting system calls from the target architecture to the host architecture. This allows you to create lightweight containers and compile programs as if doing so locally. Docker uses this method for multi-platform builds.

### Method 4: Cross-Compilation

Cross-compilers run on one architecture but generate executables for another. For example, an amd64 C++ cross-compiler on Linux can produce an aarch64 executable. This method has no performance loss since it doesn't use an emulator, but its complexity depends on the programming language.

## Building Multi-Platform Docker Images

The `buildx` plugin acts as the next-generation `docker build` command, using BuildKit to expand functionality. Here is how to use it.

### Enable the buildx Plugin

Ensure you are using Docker 19.03 or newer. Verify it is active:

```bash
docker buildx version
```

If the plugin isn't available (e.g., on Arch Linux), compile it from source:

```bash
export DOCKER_BUILDKIT=1
docker build --platform=local -o . git://github.com/docker/buildx
mkdir -p ~/.docker/cli-plugins && mv buildx ~/.docker/cli-plugins/docker-buildx
```

### Enable binfmt_misc

Docker Desktop (macOS and Windows) enables `binfmt_misc` by default. On Linux, enable it manually by running a privileged setup container (kernel 4.x or higher recommended):

```bash
docker run --rm --privileged docker/binfmt:66f9012c56a8316f9244ffd7622d7c21c1f6f28d
```

Verify `binfmt_misc` is active:

```bash
ls -al /proc/sys/fs/binfmt_misc/
cat /proc/sys/fs/binfmt_misc/qemu-aarch64
```

### Switch to a Multi-Platform Builder

Docker's default builder does not support multi-CPU architectures. Create and switch to a new builder:

```bash
docker buildx create --use --name mybuilder
docker buildx inspect mybuilder --bootstrap
```

View the supported CPU architectures:

```bash
docker buildx ls
```

### Build Multi-Platform Images

With a multi-platform builder active, you can build images supporting multiple architectures. Given a simple Golang program:

```go
// hello.go
package main

import (
        "fmt"
        "runtime"
)

func main() {
        fmt.Printf("Hello, %s!\n", runtime.GOARCH)
}
```

Create a multi-stage `Dockerfile`:

```dockerfile
# Dockerfile
FROM golang:alpine AS builder
RUN mkdir /app
ADD . /app/
WORKDIR /app
RUN go build -o hello .

FROM alpine
RUN mkdir /app
WORKDIR /app
COPY --from=builder /app/hello .
CMD ["./hello"]
```

Use `buildx` to build the image for ARM, arm64, and amd64 architectures, and push it to Docker Hub (requires `docker login`):

```bash
docker buildx build -t nxdun/hello-arch --platform=linux/arm,linux/arm64,linux/amd64 . --push
```

Docker automatically pulls the correct image for your architecture when running `docker pull nxdun/hello-arch`. Behind the scenes, `buildx` uses QEMU to build three distinct images and creates a manifest list pointing to them.

To save images locally, you must build them separately for each architecture:

```bash
docker buildx build -t nxdun/hello-arch --platform=linux/arm -o type=docker .
docker buildx build -t nxdun/hello-arch --platform=linux/arm64 -o type=docker .
docker buildx build -t nxdun/hello-arch --platform=linux/amd64 -o type=docker .
```

### Test Multi-Platform Images

With `binfmt_misc` active, you can run images for any CPU architecture locally.

List the image digests:

```bash
docker buildx imagetools inspect nxdun/hello-arch
```

Run each image by its digest to verify:

```bash
docker run --rm docker.io/nxdun/hello-arch:latest@sha256:38e083870044cfde7f23a2eec91e307ec645282e76fd0356a29b32122b11c639
# Hello, arm!

docker run --rm docker.io/nxdun/hello-arch:latest@sha256:de273a2a3ce92a5dc1e6f2d796bb85a81fe1a61f82c4caaf08efed9cf05af66d
# Hello, arm64!

docker run --rm docker.io/nxdun/hello-arch:latest@sha256:8b735708d7d30e9cd6eb993449b1047b7229e53fbcebe940217cb36194e9e3a2
# Hello, amd64!
```

## Summary

Running software across different CPU architectures presents challenges. Docker's `buildx` simplifies this process. Without altering your `Dockerfile`, you can create and push multi-architecture images to Docker Hub. Any system with Docker can seamlessly pull the correct image for its CPU architecture.

## References

[^1]: QEMU: [https://www.wikiwand.com/zh-hans/QEMU](https://www.wikiwand.com/zh-hans/QEMU)

[^2]: binfmt_misc: [https://en.wikipedia.org/wiki/Binfmt_misc](https://en.wikipedia.org/wiki/Binfmt_misc)

[^3]: chroot: [https://en.wikipedia.org/wiki/Chroot](https://en.wikipedia.org/wiki/Chroot)

[^4]: buildx: [https://github.com/docker/buildx](https://github.com/docker/buildx)

[^5]: BuildKit: [https://github.com/moby/buildkit](https://github.com/moby/buildkit)

[^6]: Docker Hub: [https://hub.docker.com/](https://hub.docker.com/)

[^7]: manifest: [https://docs.docker.com/engine/reference/commandline/manifest/](https://docs.docker.com/engine/reference/commandline/manifest/)

[^8]: Building Multi-Arch Images for Arm and x86 with Docker Desktop: [https://engineering.docker.com/2019/04/multi-arch-images/](https://engineering.docker.com/2019/04/multi-arch-images/)

[^9]: Getting started with Docker for Arm on Linux: [https://engineering.docker.com/2019/06/getting-started-with-docker-for-arm-on-linux/](https://engineering.docker.com/2019/06/getting-started-with-docker-for-arm-on-linux/)

[^10]: Leverage multi-CPU architecture support: https://docs.docker.com/docker-for-mac/multi-arch/
