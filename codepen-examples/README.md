# Vaul Web Component - CodePen Examples

This directory contains comprehensive examples demonstrating the features and capabilities of the Vaul Web Component library. Each example is designed to be self-contained and can be easily copied to CodePen or used as a starting point for your own projects.

## 📁 Examples Overview

### 1. Basic Bottom Drawer (`basic-bottom-drawer.html`)

- **Purpose**: Simple introduction to the drawer component
- **CodePen**: [Live Demo](https://codepen.io/bahaha/pen/GgpREpX)
- **Features**:
    - Basic bottom drawer implementation
    - Handle with drag-to-dismiss
    - Click outside to close
    - Keyboard accessibility (ESC key)
- **Use Cases**: Getting started, basic modal dialogs

### 2. Directional Drawers (`directional-drawers.html`)

- **Purpose**: Demonstrates drawers sliding from all four directions
- **Features**:
    - Bottom drawer (slides up)
    - Top drawer (slides down)
    - Left drawer (slides right)
    - Right drawer (slides left)
    - Direction-specific styling and use cases
- **Use Cases**: Navigation menus, side panels, notifications

### 3. Custom Handle Examples (`custom-handle-example.html`)

- **Purpose**: Showcases different handle customization options
- **Features**:
    - Default handle styling
    - Custom rose handle with shadows
    - Animated gradient handle
    - Pill-shaped handle with shimmer effect
    - Dotted handle with sequential animation
    - No handle (modal-style)
- **Use Cases**: Branding, visual consistency, unique interactions

### 4. Rich Styled Drawer (`rich-styled-drawer.html`)

- **Purpose**: Advanced styling and visual effects demonstration
- **Features**:
    - Gradient backgrounds with animations
    - Glass morphism effects
    - Floating elements with physics
    - Interactive progress bars
    - Custom scrollbars
    - Backdrop blur effects
- **Use Cases**: Premium UX, dashboards, feature showcases

### 5. Dismissible Behavior (`dismissible-behavior.html`)

- **Purpose**: Demonstrates different dismissal behaviors and use cases
- **Features**:
    - Dismissible drawers (backdrop click enabled)
    - Non-dismissible drawers (backdrop click disabled)
    - Modal-style dialogs
    - Confirmation dialogs
    - Form protection
    - Quick actions
- **Use Cases**: Critical actions, forms, user confirmations

## 🚀 Getting Started

1. **Choose an Example**: Select the example that best matches your use case
2. **Copy the HTML**: Each file is self-contained with all necessary HTML, CSS, and JavaScript
3. **Customize**: Modify the styling, content, and behavior to match your needs
4. **Import Library**: All examples use the library from `https://esm.sh/vaul-web-component@0.1.0`

## 🎯 Key Component Structure

All examples follow the correct component structure:

```html
<vaul-drawer direction="bottom" dismissible="true">
    <vaul-drawer-trigger>
        <button>Open Drawer</button>
    </vaul-drawer-trigger>
    <vaul-drawer-portal>
        <vaul-drawer-content>
            <!-- Your content here -->
        </vaul-drawer-content>
    </vaul-drawer-portal>
</vaul-drawer>
```

### Component Hierarchy

- `vaul-drawer` - Container component
    - `vaul-drawer-trigger` - Trigger element
    - `vaul-drawer-portal` - Portal wrapper (**required**)
        - `vaul-drawer-content` - Content container
        - `vaul-drawer-handle` - Optional custom handle

### Important Notes

- `vaul-drawer-portal` is **required** and must wrap `vaul-drawer-content`
- Use `show-handle="false"` on `vaul-drawer-portal` to disable built-in handles
- Custom handles can be added using `vaul-drawer-handle` element

## 🎨 Styling Guide

### CSS Integration

- All examples use **Tailwind CSS** for styling
- Custom CSS is included in `<style>` tags for advanced effects
- Easy to adapt to other CSS frameworks

### Customization Options

- **Directions**: `top`, `bottom`, `left`, `right`
- **Dismissible**: `true` (default) or `false`
- **Handle**: Built-in or custom via `vaul-drawer-handle`
- **Portal**: `show-handle="false"` to disable built-in handle

## 🔧 Technical Features

### Accessibility

- Focus trap when drawer is open
- Keyboard navigation (ESC key)
- Screen reader support
- Proper ARIA attributes

### Performance

- Smooth animations and transitions
- Efficient DOM manipulation
- Minimal bundle size impact

### Mobile Optimization

- Touch-friendly interactions
- Gesture support (swipe to dismiss)
- Safe area support for iOS/Android
- Responsive design

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔗 Resources

- **NPM Package**: [vaul-web-component](https://www.npmjs.com/package/vaul-web-component)
- **Original Inspiration**: [Vaul by Emil Kowalski](https://github.com/emilkowalski/vaul)
- **Documentation**: [Component API Reference](../README.md)

## 💡 Usage Tips

### When to Use Each Example

1. **Basic Bottom Drawer**: Simple confirmations, quick actions
2. **Directional Drawers**: Navigation, contextual menus
3. **Custom Handles**: Branding, unique visual identity
4. **Rich Styled**: Premium features, dashboards
5. **Dismissible Behavior**: Critical actions, forms

### Best Practices

- Use **dismissible="false"** for critical actions
- Provide clear visual feedback for handle interactions
- Test on mobile devices for touch interactions
- Consider accessibility when customizing

## 🤝 Contributing

If you create additional examples or improvements:

1. Follow the existing file naming convention
2. Include comprehensive comments
3. Test across different devices and browsers
4. Update this README with new examples

---

_Built with ❤️ using Web Components, TypeScript, and Tailwind CSS_
