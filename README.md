# Vaul Web Component

![NPM Version](https://img.shields.io/npm/v/vaul-web-component)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/vaul-web-component)
![License](https://img.shields.io/github/license/bahaha/vaul-web-component.svg)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/bahaha/vaul-web-component?utm_source=oss&utm_medium=github&utm_campaign=bahaha%2Fvaul-web-component&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

A customizable drawer web component inspired by [Vaul](https://github.com/emilkowalski/vaul).

## Features

-   **Native Web Components** - Works with any framework or vanilla JavaScript
-   **Accessible** - Built with native `<dialog>` element and proper ARIA attributes
-   **Directional** - Supports top, bottom, left, and right drawer positioning
-   **Smooth Animations** - CSS-based animations with customizable easing
-   **Drag to Dismiss** - Interactive gesture support for closing drawers
-   **Focus Management** - Automatic focus trapping and restoration
-   **Scroll Lock** - Prevents body scrolling when drawer is open
-   **TypeScript** - Full TypeScript support with type definitions

## Installation

```bash
npm install vaul-web-component
```

```bash
yarn add vaul-web-component
```

```bash
bun add vaul-web-component
```

## Quick Start

### Import and Register

```javascript
// Import all components
import "vaul-web-component";

// Or import specific components
import { VaulDrawer, VaulDrawerTrigger, VaulDrawerContent, VaulDrawerHandle } from "vaul-web-component";
```

### Basic Usage

```html
<vaul-drawer>
    <vaul-drawer-trigger>
        <button>Open Drawer</button>
    </vaul-drawer-trigger>

    <vaul-drawer-portal>
        <vaul-drawer-content>
            <vaul-drawer-handle></vaul-drawer-handle>
            <div class="drawer-body">
                <h2>Drawer Content</h2>
                <p>This is the content of the drawer.</p>
            </div>
        </vaul-drawer-content>
    </vaul-drawer-portal>
</vaul-drawer>
```

## Examples

### Bottom Drawer (Default)

```html
<vaul-drawer>
    <vaul-drawer-trigger>
        <button>Open Bottom Drawer</button>
    </vaul-drawer-trigger>

    <vaul-drawer-portal>
        <vaul-drawer-content>
            <vaul-drawer-handle></vaul-drawer-handle>
            <div style="padding: 20px;">
                <h3>Bottom Drawer</h3>
                <p>Slides up from the bottom of the screen.</p>
            </div>
        </vaul-drawer-content>
    </vaul-drawer-portal>
</vaul-drawer>
```

### Top Drawer

```html
<vaul-drawer direction="top">
    <vaul-drawer-trigger>
        <button>Open Top Drawer</button>
    </vaul-drawer-trigger>

    <vaul-drawer-portal>
        <vaul-drawer-content>
            <vaul-drawer-handle></vaul-drawer-handle>
            <div style="padding: 20px;">
                <h3>Top Drawer</h3>
                <p>Slides down from the top of the screen.</p>
            </div>
        </vaul-drawer-content>
    </vaul-drawer-portal>
</vaul-drawer>
```

### Left Drawer

```html
<vaul-drawer direction="left">
    <vaul-drawer-trigger>
        <button>Open Left Drawer</button>
    </vaul-drawer-trigger>

    <vaul-drawer-portal>
        <vaul-drawer-content>
            <div style="padding: 20px;">
                <h3>Left Drawer</h3>
                <p>Slides in from the left side.</p>
            </div>
        </vaul-drawer-content>
    </vaul-drawer-portal>
</vaul-drawer>
```

### Right Drawer

```html
<vaul-drawer direction="right">
    <vaul-drawer-trigger>
        <button>Open Right Drawer</button>
    </vaul-drawer-trigger>

    <vaul-drawer-portal>
        <vaul-drawer-content>
            <div style="padding: 20px;">
                <h3>Right Drawer</h3>
                <p>Slides in from the right side.</p>
            </div>
        </vaul-drawer-content>
    </vaul-drawer-portal>
</vaul-drawer>
```

## Live Examples

-   [Basic Bottom Drawer](https://codepen.io/bahaha/pen/GgpREpX) - Simple drawer with trigger button
-   [Directional Drawers](https://codepen.io/bahaha/pen/directional-drawers) - All four directions in one demo
-   [Custom Handle Examples](https://codepen.io/bahaha/pen/custom-handle-examples) - Different handle styles and animations
-   [Rich Styled Drawer](https://codepen.io/bahaha/pen/rich-styled-drawer) - Advanced styling with animations and effects
-   [Dismissible Behavior](https://codepen.io/bahaha/pen/dismissible-behavior) - Different dismissal behaviors and use cases

> **📁 More Examples**: Check out the [`/codepen-examples`](./codepen-examples) folder for additional ready-to-use examples with comprehensive documentation.

## API Reference

### Components

#### `<vaul-drawer>`

The main container component that manages the drawer state.

**Attributes:**

-   `direction` - Drawer direction: `"top"`, `"bottom"` (default), `"left"`, `"right"`
-   `dismissible` - Boolean attribute to control backdrop dismissal: `"true"` (default), `"false"`
-   `open` - Boolean attribute to control drawer state programmatically

**Events:**

-   `drawer-open` - Fired when drawer opens
-   `drawer-close` - Fired when drawer closes

#### `<vaul-drawer-trigger>`

Wrapper for the trigger element that opens the drawer.

#### `<vaul-drawer-portal>`

Portal container that wraps the drawer content. **Required** for proper component structure.

**Attributes:**

-   `show-handle` - Boolean attribute to control built-in handle visibility: `"true"` (default), `"false"`

#### `<vaul-drawer-content>`

Container for the drawer content. Uses native `<dialog>` element for accessibility.

#### `<vaul-drawer-handle>`

Drag handle for gesture-based drawer interactions (optional). Can be used for custom handle styling.

### Programmatic Control

```javascript
// Get drawer element
const drawer = document.querySelector("vaul-drawer");

// Open drawer
drawer.setAttribute("open", "");

// Close drawer
drawer.removeAttribute("open");

// Listen for events
drawer.addEventListener("drawer-open", () => {
    console.log("Drawer opened");
});

drawer.addEventListener("drawer-close", () => {
    console.log("Drawer closed");
});
```

## Styling

The components are unstyled by default. You can style them using CSS:

```css
/* Style the drawer content */
vaul-drawer-content {
    background: white;
    border-radius: 8px 8px 0 0;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

/* Style the handle */
vaul-drawer-handle {
    background: #e5e7eb;
    border-radius: 4px;
    width: 32px;
    height: 4px;
    margin: 8px auto;
}

/* Style the trigger button */
vaul-drawer-trigger button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}
```

## Browser Support

-   Chrome/Edge 88+
-   Firefox 98+
-   Safari 15.4+

## Inspiration

This project is inspired by Emil Kowalski's excellent [Vaul](https://github.com/emilkowalski/vaul) library, which provides an unstyled drawer component for React. This web component version aims to bring similar functionality to vanilla JavaScript and other frameworks.

## Development

### Tech Stack

-   [Bun](https://bunpkg.com/) - Package manager and runtime
-   [Vite](https://vitejs.dev/) - Build tool
-   [TypeScript](https://www.typescriptlang.org/) - Type safety
-   [Vitest](https://vitest.dev/) - Unit testing
-   [Playwright](https://playwright.dev/) - E2E testing
-   [Prettier](https://prettier.io/) - Code formatting
-   [oxlint](https://oxc.rs/) - Fast linting

### Getting Started

```bash
# Clone the repository
git clone https://github.com/bahaha/vaul-web-component.git

# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Build for production
bun run build
```
