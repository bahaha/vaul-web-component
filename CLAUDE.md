# CLAUDE.md

Developer guidance for Claude Code when working with this TypeScript web component library.

## Project Overview

**Vaul Web Component** - A TypeScript library providing a native web component implementation of drawer/modal interfaces with directional positioning and smooth animations.

**Tech Stack**: Web Components + Shadow DOM + @preact/signals + Native `<dialog>` + CSS animations  
**Package Manager**: Bun  
**Build Tool**: Vite  
**Testing**: Vitest (unit) + Playwright (e2e)

## Essential Commands

### Core Development

-   `bun run dev` - Start development server with hot reload
-   `bun run build` - Production build with TypeScript compilation and bundling
-   `bun run test` - Unit tests (Vitest)
-   `bun run test:e2e` - End-to-end tests (Playwright)
-   `bun run check` - Full validation (lint + format + tests)

### Quality Assurance

-   `bun run lint` / `bun run lint:fix` - Code linting with oxlint
-   `bun run format` / `bun run format:check` - Code formatting with Prettier
-   `bun run test:coverage` - Unit test coverage report
-   `bun run test:all` - Complete test suite

### Release & Deployment

-   `bun run release` - Build and publish to npm
-   `gh pr merge -s -d <pr-id>` - **REQUIRED**: Squash merge PRs and delete branches

## Component Architecture

### Core Components

-   **VaulDrawer** - Container component managing dialog state and child coordination
-   **VaulDrawerTrigger** - Interactive trigger element with click handling
-   **VaulDrawerContent** - Content wrapper using native `<dialog>` with Shadow DOM

### Technical Implementation

-   **Base**: Custom HTMLElement classes with Shadow DOM encapsulation
-   **State**: @preact/signals for reactive direction management
-   **Dialog**: Native `<dialog>` element for accessibility and keyboard handling
-   **Communication**: Parent-child via `closest()` pattern
-   **Styling**: External CSS files with slot-based content projection

## Development Standards

### React Vaul Reference Rule

-   **CRITICAL**: When implementing features that need to match or reference the React vaul implementation, always ask for feedback before proceeding. Do not assume implementation details without confirmation.

### Code Style

-   **Private Fields**: `#fieldName` syntax (not `private` keyword)
-   **CSS Imports**: External files with `?raw` imports (no inline styles)
-   **Constants**: `as const` assertions for readonly arrays
-   **Control Flow**: Early returns over nested conditionals
-   **Comments**: Avoid unless explicitly requested
-   **Functions**: Generic names supporting multiple operations

### Shadow DOM & CSS

-   **Encapsulation**: `attachShadow({ mode: "open" })` + slot-based projection
-   **CSS Properties**: Explicit properties (not shorthand), custom properties in `:host`
-   **Modern CSS**: Nesting, logical properties, container queries where appropriate

### Performance & Cleanup

-   **Event Handling**: Always implement `disconnectedCallback()` for cleanup
-   **Logging**: Injectable system, user-facing errors only (no verbose debug)
-   **DOM APIs**: Modern methods (`element.dataset.property` vs `getAttribute`)

## Build Configuration

### Core Setup

-   **Entry**: `src/index.ts` → ESM output via package.json exports
-   **TypeScript**: Strict config with path aliases (`@/src`, `@@/root`)
-   **Bundling**: Vite for ESM, dts-bundle-generator for single `.d.ts` file
-   **Linting**: oxlint (fast TS/JS) + Prettier formatting

### Testing Strategy

-   **Unit Tests**: Co-located with source (`src/*.test.ts`), business logic focus
-   **E2E Tests**: `e2e/*.spec.ts`, UI/visual behavior, cross-browser (Chrome/Firefox/Safari)
-   **Test Patterns**: Template literals for DOM setup, feature-based naming
-   **Coverage**: Minimal focused tests, avoid redundancy

### Key Configuration Files

```
package.json              # Dependencies, scripts, exports
dts-bundle-generator.config.ts    # Type definitions bundling
vite.config.ts           # Build configuration
playwright.config.ts     # E2E testing setup
```

## Project Management

### GitHub Labels

-   `feature` - New feature implementation
-   `animation` - Animations and transitions
-   `enhancement` - Feature improvements
-   `bug` - Problems and errors
-   `documentation` - Documentation updates
-   `question` - Information requests
-   `duplicate` - Already exists
-   `wontfix` - Will not be addressed

### Workflow

-   **Issues**: Use for feature planning and bug tracking
-   **PRs**: Always squash merge with `gh pr merge -s -d <pr-id>`
-   **Milestones**: Track in `MILESTONES.md` with detailed success criteria
-   **Branching**: Feature branches from `main`, delete after merge
