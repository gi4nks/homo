# Makefile for Novel AI Architect (Next.js Project)

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
