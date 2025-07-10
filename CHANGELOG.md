# Change Log

All notable changes to the "vaul-web-component" project will be documented in this file.

## Known Issues

### [Bug] Focus restoration after drawer closes

- **Issue**: When a drawer closes, focus doesn't restore to the previously focused element
- **Impact**: Accessibility issue - users lose their place in tab navigation
- **Status**: Identified but not yet implemented
- **Labels**: `bug`, `accessibility`
- **Details**: Native dialog focus restoration conflicts with custom focus management. Requires coordination between dialog close events and focus restoration timing.

## [0.1.0] - 2024-06-29

- Initial release
- Basic drawer functionality with directional positioning
- Focus trap implementation for open drawers
- Scroll lock with background interaction prevention
