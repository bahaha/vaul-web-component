# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a TypeScript library built with Vite and uses Bun as the package manager.

### Building

-   `bun run build` - Full build: compile TypeScript, bundle with Vite, and generate type definitions
-   `bun run prebuild` - Clean dist directory (runs automatically before build)
-   `bun run postbuild` - Generate bundled type definitions (runs automatically after build)

### Testing

-   `bun run test` - Run unit tests with Vitest
-   `bun run test:coverage` - Run unit tests with coverage report
-   `bun run test:e2e` - Run end-to-end tests with Playwright
-   `bun run test:e2e-ui` - Run Playwright tests with UI mode
-   `bun run test:e2e-headed` - Run Playwright tests in headed mode (visible browser)
-   `bun run test:all` - Run both unit and e2e tests

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

This is a TypeScript library for a web component drawer system with the following tech stack and structure:

### Tech Stack

-   **Web Components**: Custom elements using HTMLElement base class with Shadow DOM
-   **State Management**: @preact/signals for reactive state management (planned)
-   **Dialog Implementation**: Native HTML `<dialog>` element for drawer content
-   **Shadow DOM**: Encapsulated styling and slot-based content projection
-   **Component Communication**: Uses `closest()` pattern for parent-child communication

### Component Structure

-   **VaulDrawer**: Container component that manages dialog reference and coordinates child components
-   **VaulDrawerTrigger**: Clickable element with slot content and click event handling
-   **VaulDrawerContent**: Drawer content wrapper using native `<dialog>` element in shadow DOM

### Coding Preferences

-   **Private Fields**: Use `#` prefix instead of `private` keyword for class members
-   **External CSS**: Use separate CSS files with Vite raw imports (`?raw`) instead of inline styles
-   **Shadow DOM**: All components use `attachShadow({ mode: "open" })` with slot-based content projection
-   **Logging**: Use injectable logger system, only log user-facing errors/warnings, avoid verbose debug logs
-   **Event Cleanup**: Always implement `disconnectedCallback()` to remove event listeners
-   **No Comments**: Avoid adding code comments unless explicitly requested
-   **Constant Arrays**: Use `as const` for readonly constant arrays instead of explicit type annotations
-   **Early Returns**: Use early return patterns instead of nested if-else blocks
-   **Generic Naming**: Use generic function names that can handle multiple attributes/operations
-   **Explicit CSS**: Use explicit CSS properties instead of shorthand (e.g., `margin-top: 0` not `margin: 0 auto auto auto`)
-   **CSS Variables**: Define CSS custom properties in `:host` with default values
-   **Modern CSS**: Use CSS nesting and modern selectors where appropriate

### Library Template Structure

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

-   **Vitest**: Unit testing with jsdom environment for DOM testing
-   **Playwright**: End-to-end testing with cross-browser support (Chrome, Firefox, Safari, Mobile)
-   **Test Organization**: Co-locate unit tests alongside source files (e.g., `src/feature.test.ts`)
-   **Test Focus**: Unit tests focus on business logic only, e2e tests handle UI/visual behavior
-   **Test Templates**: Use `innerHTML` with template literals instead of `createElement` for cleaner test setup
-   **Test Naming**: Use feature-based naming (e.g., `drawer-direction.test.ts`, `drawer-context.test.ts`)
-   **Minimal Tests**: Keep unit tests minimal and focused, avoid verbose/redundant test cases
-   **DOM API**: Use modern DOM APIs like `element.dataset.property` instead of `getAttribute('data-property')`
-   E2E test files: `e2e/` directory with `.spec.ts` extension
-   Test server: Automatically starts Vite dev server for e2e tests

### Important Files to Update

When adapting this template:

1. `package.json` - Update name, author, repository, description
2. `dts-bundle-generator.config.ts` - Update `outFile` to match package name
3. Both configs use package.json name for consistent file naming

## GitHub Project Labels

-   `feature`: New feature to be implemented
-   `animation`: Related to animations or transitions
-   `bug`: Indicates a problem or error
-   `documentation`: Related to documentation
-   `duplicate`: Issue or pull request already exists
-   `enhancement`: New feature or request
-   `question`: Further information is requested
-   `wontfix`: Issue will not be worked on
