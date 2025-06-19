# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a TypeScript library built with Vite and uses Bun as the package manager.

### Building

-   `bun run build` - Full build: compile TypeScript, bundle with Vite, and generate type definitions
-   `bun run prebuild` - Clean dist directory (runs automatically before build)
-   `bun run postbuild` - Generate bundled type definitions (runs automatically after build)

### Testing

-   `bun run test` - Run tests with Vitest
-   `bun run test:coverage` - Run tests with coverage report

### Development

-   `bun run dev` - Start Vite dev server with host binding

### Linting & Formatting

-   `bun run lint` - Run oxlint on src and test directories
-   `bun run lint:fix` - Run oxlint with auto-fix enabled
-   `bun run format` - Format code with Prettier
-   `bun run format:check` - Check code formatting without modifying files
-   `bun run check` - Run lint, format check, and tests (useful for CI)

### Publishing

-   `bun run release` - Build and publish with np (better npm publish experience)

## Architecture

This is a TypeScript library starter template with the following structure:

### Build System

-   **Vite**: Configured to build ESM format from single entry point
-   **TypeScript**: Strict configuration with path aliases (`@/` for src, `@@/` for root)
-   **Type Definitions**: Uses dts-bundle-generator to create single bundled .d.ts file
-   **Linting**: oxlint for fast TypeScript/JavaScript linting with web component support

### Library Configuration

-   Entry point: `src/index.ts`
-   Exports ESM format via package.json exports field
-   Type definitions bundled into single file: `dist/vaul-web-component.d.ts`
-   Path aliases: `@` maps to `src/`, `@@` maps to project root

### Testing

-   **Vitest**: Configured with jsdom environment for DOM testing
-   Test files: `test/` directory with `.test.ts` extension
-   Global test utilities enabled

### Important Files to Update

When adapting this template:

1. `package.json` - Update name, author, repository, description
2. `dts-bundle-generator.config.ts` - Update `outFile` to match package name
3. Both configs use package.json name for consistent file naming
