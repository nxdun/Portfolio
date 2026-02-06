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
ifeq ($(OS),Windows_NT)
clean:
	-cmd /C "for %%d in (.astro .output .dist .yarn node_modules) do if exist %%d rmdir /s /q %%d"
else
clean:
	-rm -rf .output .dist node_modules
endif
