# Architecture

This project uses a feature based modular architecture. This document explains where files go and how they interact.

## Core Structure

- src/features/: Code for specific features like aio-downloader or blog.
- src/components/: Shared UI parts and page shells.
- src/scripts/: Global scripts that manage the whole site.
- src/utils/: Generic helper functions.
- src/data/: Global data files and schemas.
- src/pages/: Routing handled by Astro.

## Feature Boundaries

Every folder in src/features/ is an isolated module.

### Public API (index.ts)
Features must expose their public API through a root index.ts file.
- Internal logic stays in scripts/ or utils/ subfolders inside the feature.
- Public functions and types are re-exported by the root index.ts.

### Dependency Rules
- No Deep Imports: Do not import from feature internals from outside that feature.
- Root Imports Only: Always import from the feature root index.ts.
- ESLint: These rules are enforced in eslint.config.js.

### Exceptions
- Astro Components: .astro files are exempted because they cannot be re-exported easily.
- Static Data: .json and .sql files are also exempted.

## Tools Architecture

The /tools section uses a shared workbench model.

1. Workbench Core (src/scripts/tools/): Shared logic for tool registration and common UI.
2. Tool Features (src/features/aio-downloader, src/features/base64): Specific tools that register themselves into the workbench.

## Homepage Orchestration

The homepage uses deferred loading to keep things fast.
- src/scripts/home.ts handles the main page lifecycle.
- Feature specific code is kept in the feature's boot.ts and loaded only when needed.

## When Adding New Code

| If you are adding | Put it in |
| :--- | :--- |
| New Tool | src/features/<name>/ and register it in src/scripts/tools/registry.ts |
| Generic UI component | src/components/ui/ |
| Feature specific UI | src/features/<name>/components/ |
| New page or route | src/pages/ |
| Global utility | src/utils/ |

## Rules

- Keep src/utils/ small. If a helper is only for one feature, put it inside that feature.
- Use the @/ path alias for all imports.
- Do not create circular dependencies between features.
- Use the index.ts entrypoint for all feature logic.
