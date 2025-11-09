# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**My Scroll Block** is a WordPress plugin that extends core blocks (Paragraph, Image, Heading, Columns, Group) with scroll-driven animation capabilities using CSS scroll timelines. The plugin adds a "Scroll Animation" panel to the block editor and applies CSS classes/attributes to rendered blocks without requiring frontend JavaScript.

## Repository Structure

```
scrolldriven-block/
├── my-scroll-block/              # Main plugin directory
│   ├── src/                      # Source files (compiled by wp-scripts)
│   │   ├── index.js              # Main editor script with block filters
│   │   ├── editor.css            # Editor UI styles
│   │   └── style.css             # Frontend animation styles
│   ├── build/                    # Compiled assets (generated)
│   ├── tests/                    # Playwright + TypeScript tests
│   ├── my-scroll-block.php       # Main plugin file (PHP)
│   ├── package.json              # Node dependencies & scripts
│   ├── tsconfig.json             # TypeScript config (for test compilation)
│   ├── blueprint.json            # Initial configuration to start a WordPress Playground instance
│   └── playwright.config.js      # Playwright test configuration
```

## Common Development Commands

All commands run from `my-scroll-block/` directory:

```bash
# Start development server with live reload
npm start

# Build assets for production
npm run build

# Preview the changes on WordPress Playground
npm run playground:start

# Linting and formatting
npm run lint:js                   # Lint JavaScript
npm run lint:css                  # Lint CSS
npm run format                    # Format with Prettier
npm run format:check              # Check formatting

# Testing
npm test                          # Run tests (headless)
npm run test:headed               # Run tests with visible browser
npm run test:debug                # Debug mode for tests
npm run test:report               # View HTML test report
npm run typecheck                 # Validate TypeScript in tests

# Plugin packaging
npm run plugin-zip                # Create zip for WordPress

# Package updates
npm run packages-update           # Update WordPress packages
```

## Architecture & Key Concepts

### Block Extension Pattern

The plugin uses **WordPress block filters** to extend core blocks without creating new blocks:

1. **Attribute Registration** (`blocks.registerBlockType` filter): Adds `animationType` attribute to supported blocks
2. **Editor UI** (Higher-order component on `editor.BlockEdit`): Adds SelectControl dropdown in Inspector sidebar
3. **Output Rendering** (`blocks.getSaveContent.extraProps` filter): Injects CSS classes/data attributes into saved block markup
4. **Editor Preview** (`editor.BlockListBlock` filter): Applies classes in editor canvas for live preview
5. **Animation Indicator** (`editor.BlockListBlock` filter): Adds clickable visual indicator on blocks with animations

### Supported Animation Types

- `fade-in`, `slide-in-left`, `slide-in-right`, `slide-in-up`, `slide-in-down`, `scale-up`, `rotate-in`
- Applied via CSS classes: `scroll-anim-{type}` (e.g., `scroll-anim-fade-in`)
- Data attribute: `data-scroll-anim="1"`

### CSS Classes & Frontend

**Editor classes:**
- `.scroll-anim-block` - Main animation class
- `.scroll-anim-{type}` - Specific animation type class

**Frontend rendering:**
- Classes are added by PHP filters in `my-scroll-block.php` (handles dynamic blocks)
- JavaScript filters in `src/index.js` handle saved block markup in post editor
- CSS scroll timeline rules in `src/style.css` trigger animations
- No frontend JavaScript execution; animations are pure CSS

## Testing Architecture

Tests use **Playwright + TypeScript + WordPress Playground**:

- **Global Setup** (`tests/global-setup.ts`): Starts WordPress Playground server on port 9400, mounts plugin, auto-activates
- **Global Teardown** (`tests/global-teardown.ts`): Stops server
- **Tests** (`tests/scroll-block.spec.ts`): Runs against http://127.0.0.1:9400
- **Configuration** (`playwright.config.js`): Chromium only, 30-second timeout, HTML reporter
- **Blueprint** (`./my-scroll-block/blueprint.json`): Contains the initial data to initiate a WordPress Playground instance for testing

To run tests individually:
```bash
npx playwright test scroll-block.spec.ts -g "test-name-pattern"
```

## Key Files & Their Roles

| File | Purpose |
|------|---------|
| [my-scroll-block.php](my-scroll-block/my-scroll-block.php) | Plugin entry point; enqueues assets; applies render_block filter for frontend class/attr injection |
| [src/index.js](my-scroll-block/src/index.js) | Block filters for editor integration; attribute registration, UI controls, markup manipulation |
| [src/style.css](my-scroll-block/src/style.css) | CSS scroll timeline rules for all animation types |
| [src/editor.css](my-scroll-block/src/editor.css) | Editor UI styles (animation indicator, editor preview) |
| [tests/scroll-block.spec.ts](my-scroll-block/tests/scroll-block.spec.ts) | End-to-end tests for editor and frontend rendering |
| [tests/global-setup.ts](my-scroll-block/tests/global-setup.ts) | WordPress Playground startup with plugin mounting |

## When Making Changes

### Adding a New Animation Type

1. Add option to `ANIMATION_OPTIONS` array in [src/index.js](my-scroll-block/src/index.js)
2. Add CSS animation rules to [src/style.css](my-scroll-block/src/style.css) using the class `.scroll-anim-{type}`
3. Add test case in [tests/scroll-block.spec.ts](my-scroll-block/tests/scroll-block.spec.ts)
4. Rebuild: `npm run build`

### Modifying Block Support

Supported blocks are defined in:
- `SUPPORTED_BLOCKS` constant in [src/index.js](my-scroll-block/src/index.js)
- `$supported_blocks` array in [my-scroll-block.php](my-scroll-block/my-scroll-block.php) (must match)

Update both locations when changing supported blocks.

### Editor UI Changes

The animation selector is rendered via `PanelBody` + `SelectControl` components in [src/index.js](my-scroll-block/src/index.js:64-71). CSS styles for the animation indicator are in [src/editor.css](my-scroll-block/src/editor.css).

### Testing New Features

Tests run against a real WordPress instance via WordPress Playground. When adding tests:
1. Use TypeScript for type safety (`npm run typecheck` validates)
2. Ensure WordPress Playground can reach the feature (auto-login, plugin pre-activated)
3. Use page selectors that work with WordPress's block editor DOM
4. Clean up test data if needed (demo content created by `blueprint.json`)

## Debugging

- **Editor issues**: Check browser console; WordPress error logs
- **Rendering issues**: Check `npm run lint:js` and `npm run typecheck`
- **Test failures**: Run `npm run test:headed` to see browser; use `npm run test:debug`
- **Build errors**: Check `npm run build` output; verify all imports exist
- **WordPress Playground**: Port 9400 in use? Kill with `pkill -f "wp-playground"`

## Important Notes

- **No frontend JavaScript**: All animations are CSS scroll timeline-based; no JS execution on frontend
- **Plugin file mirrors source logic**: Changes to block support in `src/index.js` must be mirrored in `my-scroll-block.php`
- **CSS scroll timeline browser support**: Check [Can I Use](https://caniuse.com/?search=scroll-timeline)

## WordPress Playground Testing

When working on this WordPress plugin, you can help users test changes by providing a WordPress Playground link that uses the current branch.

### How to Generate Playground Links

When you've made changes to the plugin and pushed to a branch, provide a WordPress Playground link in this format:

```
https://playground.wordpress.net/#{%22steps%22:[{%22step%22:%22installPlugin%22,%22pluginData%22:{%22resource%22:%22git:directory%22,%22url%22:%22https://github.com/fellyph/scrolldriven-block%22,%22ref%22:%22BRANCH_NAME%22,%22refType%22:%22branch%22},%22options%22:{%22activate%22:true}}]}
```

Replace `BRANCH_NAME` with the actual branch name you're working on.

### Example

If working on branch `claude/add-feature-xyz`, the link would be:

```
https://playground.wordpress.net/#{%22steps%22:[{%22step%22:%22installPlugin%22,%22pluginData%22:{%22resource%22:%22git:directory%22,%22url%22:%22https://github.com/fellyph/scrolldriven-block%22,%22ref%22:%22claude/add-feature-xyz%22,%22refType%22:%22branch%22},%22options%22:{%22activate%22:true}}]}
```

### When to Provide Links

- After completing a feature implementation
- After fixing a bug
- When the user requests to test changes
- After creating or updating a pull request

### Message Format

When providing the link, use this format:

```markdown
## Test These Changes in WordPress Playground

You can test the changes from branch `BRANCH_NAME` directly in WordPress Playground:

[Launch WordPress Playground](PLAYGROUND_URL)

This will install and activate the plugin with the changes from this branch.
```

### Notes

- The playground link uses the GitHub repository as the source
- The `installPlugin` step automatically installs and activates the plugin
- Users can test the changes without needing to set up a local WordPress environment
- This mirrors the functionality of the GitHub action in `.github/workflows/pr-playground-comment.yml` but uses branches instead of PR refs
- Important: Use `"refType":"branch"` when referencing branch names, not `"refType":"refname"` (which is used for full refs like `refs/pull/123/head`)