.PHONY: default dev build preview sync format format-check lint clean

PROJECT_NAME ?= $(shell node -e "console.log(require('./package.json').name)")
PROJECT_VERSION ?= $(shell node -e "console.log(require('./package.json').version)")

#run make with no arguments
default: dev

#interoperable 
dev:
	@echo "Running $(PROJECT_NAME) version $(PROJECT_VERSION) in development mode..."
	pnpm run dev

build:
	pnpm run build

preview:
	pnpm run preview

sync:
	pnpm run sync

format:
	pnpm run format

format-check:
	pnpm run format:check

lint:
	pnpm run lint

# cross-platform
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf dist node_modules .astro dist

