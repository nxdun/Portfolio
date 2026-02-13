.PHONY: default dev build preview sync format format-check lint clean deploy d-p install check help test-env i c f guard-%
.DELETE_ON_ERROR: $(NODE_MODULES)/.install-timestamp
.PRECIOUS: $(DIST_DIR)/.build-timestamp $(NODE_MODULES)/.install-timestamp

MAKEFLAGS += --warn-undefined-variables
.DEFAULT_GOAL := help

PROJECT_NAME ?= $(shell node -e "console.log(require('./package.json').name)")
PROJECT_VERSION ?= $(shell node -e "console.log(require('./package.json').version)")
BUILD_TIME := $(shell date -u '+%Y-%m-%d_%H:%M:%S_UTC')

VERBOSE ?= true
DIST_DIR := dist
NODE_MODULES := node_modules
BUILD_ARTIFACTS := $(DIST_DIR) $(NODE_MODULES) .astro public/pagefind

i: install
c: check
f: format

RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m

ifeq ($(VERBOSE),true)
	Q :=
	SAY := @echo -e
else
	Q := @
	SAY := @echo -e
endif

ifeq ($(OS),Windows_NT)
	NPROCS := $(NUMBER_OF_PROCESSORS)
else ifeq ($(shell uname -s),Darwin)
	NPROCS := $(shell sysctl -n hw.physicalcpu)
else
	NPROCS := $(shell nproc)
endif

help:
	$(SAY) "$(BLUE)Available targets for $(PROJECT_NAME) v$(PROJECT_VERSION):$(NC)"
	$(Q)grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

# -----------------------
# Development
# -----------------------
install: $(NODE_MODULES)/.install-timestamp

$(NODE_MODULES)/.install-timestamp: package.json pnpm-lock.yaml
	$(SAY) "$(YELLOW)Installing dependencies...$(NC)"
	$(Q)pnpm install
	$(Q)touch $@

dev: $(NODE_MODULES)/.install-timestamp ## Run dev server (pnpm dev)
	$(SAY) "$(GREEN)Starting dev server...$(NC)"
	$(Q)pnpm run dev

# -----------------------
# Build
# -----------------------
build: $(DIST_DIR)/.build-timestamp ## Build production (pnpm build)

$(DIST_DIR)/.build-timestamp: $(NODE_MODULES)/.install-timestamp $(shell find src -type f 2>/dev/null)
	$(SAY) "$(BLUE)Building $(PROJECT_NAME)...$(NC)"
	$(Q)pnpm run build
	$(Q)touch $@
	$(SAY) "$(GREEN)✓ Build completed at $(BUILD_TIME)$(NC)"

preview: $(DIST_DIR)/.build-timestamp ## Preview build (pnpm preview)
	$(SAY) "$(BLUE)Starting preview...$(NC)"
	$(Q)pnpm run preview

deploy: guard-production clean install format build ## Deploy (pnpm deploy)
	$(SAY) "$(GREEN)Deploying $(PROJECT_NAME)...$(NC)"
	$(Q)wrangler pages deploy

d-p: build ## Deploy preview branch
	$(SAY) "$(YELLOW)Deploying preview...$(NC)"
	$(Q)wrangler pages deploy --branch=$(shell git rev-parse --abbrev-ref HEAD)

# -----------------------
# Code Quality
# -----------------------
sync: ## Sync types (pnpm sync)
	$(Q)pnpm run sync

format: ## Format code (pnpm format)
	$(SAY) "$(BLUE)Formatting code...$(NC)"
	$(Q)pnpm run format

format-check: ## Check format (pnpm format:check)
	$(SAY) "$(BLUE)Checking format...$(NC)"
	$(Q)pnpm run format:check

lint: ## Lint code (pnpm lint)
	$(SAY) "$(BLUE)Linting code...$(NC)"
	$(Q)pnpm run lint

check: ## parallel
	$(SAY) "$(BLUE)Running checks in parallel ($(NPROCS) threads)...$(NC)"
	$(Q)$(MAKE) -j$(NPROCS) lint format-check
	$(SAY) "$(GREEN)✓ All checks passed$(NC)"

# -----------------------
# Utilities
# -----------------------
clean: ## Clean artifacts
	$(SAY) "$(RED)Cleaning...$(NC)"
	$(Q)rm -rf $(BUILD_ARTIFACTS)

guard-%: ## Guard target for environment variables (e.g., guard-production)
	$(Q)if [ "$($(*))" != "true" ]; then \
		echo "$(RED)Error: This target requires $*=true$(NC)"; \
		exit 1; \
	fi
