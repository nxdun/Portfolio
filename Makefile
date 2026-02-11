.PHONY: default dev build preview sync format format-check lint clean deploy install

PROJECT_NAME ?= $(shell node -e "console.log(require('./package.json').name)")
PROJECT_VERSION ?= $(shell node -e "console.log(require('./package.json').version)")

#run make with no arguments
default: dev

# make install:  will install the dependencies
install:
	pnpm install

# make dev:  will run the development server
dev:
	@echo "Running $(PROJECT_NAME) version $(PROJECT_VERSION) in development mode..."
	pnpm run dev

# make build:  will build the project
build:
	pnpm run build

# make preview:  will preview the production build
preview:
	pnpm run preview

# make sync:  will sync the project with the latest changes from the repository
sync:
	pnpm run sync

# make format:  will format the code using Prettier
format:
	pnpm run format

# make format-check:  will check the code format using Prettier
format-check:
	pnpm run format:check

# make lint:  will run the linter to check for code quality issues
lint:
	pnpm run lint

# make deploy:  will deploy the project to the cloudflare pages
deploy: clean install format build
	@echo "Deploying $(PROJECT_NAME) version $(PROJECT_VERSION)..."
	pnpm run deploy

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf dist node_modules .astro public/pagefind

