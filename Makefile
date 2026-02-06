.PHONY: default dev build preview sync format format-check lint clean

PROJECT_NAME ?= $(shell node -e "console.log(require('./package.json').name)")
PROJECT_VERSION ?= $(shell node -e "console.log(require('./package.json').version)")

#run make with no arguments
default: dev

#interoperable 
dev:
	@echo "Running $(PROJECT_NAME) version $(PROJECT_VERSION) in development mode..."
	npm run dev

build:
	npm run build

preview:
	npm run preview

sync:
	npm run sync

format:
	npm run format

format-check:
	npm run format:check

lint:
	npm run lint

# cross-platform
ifeq ($(OS),Windows_NT)
clean:
	-cmd /C "for %%d in (.astro .output .dist .yarn node_modules) do if exist %%d rmdir /s /q %%d"
else
clean:
	-rm -rf .output .dist node_modules
endif
