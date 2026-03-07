# Makefile for HOMO (Next.js Project)

.PHONY: help install dev build start lint clean db-migrate db-generate db-studio

# Default target: show help
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install      Install project dependencies"
	@echo "  dev          Run the development server"
	@echo "  build        Build the production application"
	@echo "  start        Start the production server"
	@echo "  lint         Run ESLint to check code quality"
	@echo "  db-migrate   Run Prisma database migrations"
	@echo "  db-generate  Generate Prisma Client"
	@echo "  db-studio    Open Prisma Studio (DB GUI)"
	@echo "  clean        Remove build artifacts and node_modules"
	@echo "  bump-patch   Increment version by patch (0.0.X)"
	@echo "  bump-minor   Increment version by minor (0.X.0)"
	@echo "  bump-major   Increment version by major (X.0.0)"
	@echo "  version-show Display current version from package.json"

# Install dependencies
install:
	npm install

# Run development server
dev:
	npm run dev

# Build for production
build:
	npm run build

# Start production server
start:
	npm run start

# Run linter
lint:
	npm run lint

# Database Migrations
db-migrate:
	npx prisma migrate dev

# Generate Prisma Client
db-generate:
	npx prisma generate

# Database Studio
db-studio:
	npx prisma studio

# Clean up
clean:
	rm -rf .next
	rm -rf node_modules
	@echo "Cleanup complete."

# Versioning
bump-patch:
	npm version patch --no-git-tag-version

bump-minor:
	npm version minor --no-git-tag-version

bump-major:
	npm version major --no-git-tag-version

version-show:
	@echo "HOMO ENGINE v$$(node -p \"require('./package.json').version\")"
