# CLAUDE.md

This file provides guidance for Claude Code and other AI assistants working with this repository.

## Project Overview

**My Scroll Block** is a WordPress plugin that extends core blocks with scroll-driven animation capabilities using native CSS scroll timelines. The plugin adds a "Scroll Animation" panel to the block editor for supported blocks, enabling animations that are triggered as users scroll the page.

### Key Characteristics

- **CSS-Only Frontend**: All animations use native CSS scroll timelines - no JavaScript execution on the frontend
- **Block Extension Pattern**: Extends existing WordPress core blocks rather than creating new blocks
- **Accessibility-First**: Respects `prefers-reduced-motion` system preference automatically
- **Progressive Enhancement**: Uses `@supports` queries for graceful degradation in unsupported browsers

### Requirements

- WordPress 6.8+
- PHP 7.4+
- Modern browser with CSS scroll timeline support

## Repository Structure

```
scrolldriven-block/
├── src/                              # Source files (compiled by wp-scripts)
│   ├── index.js                      # Main editor script with block filters
│   ├── editor.css                    # Editor UI styles
│   ├── style.css                     # Frontend animation styles (CSS scroll timelines)
│   └── progress-block/               # Reading Progress Bar block
│       ├── index.js                  # Block registration
│       ├── block.json                # Block metadata
│       ├── editor.css                # Editor styles
│       └── style.css                 # Frontend styles
├── build/                            # Compiled assets (generated, do not edit)
├── tests/                            # Playwright + TypeScript tests
│   ├── scroll-block.spec.ts          # Main e2e test suite
│   ├── reduced-motion.spec.ts        # Accessibility tests
│   ├── global-setup.ts               # WordPress Playground initialization
│   ├── global-teardown.ts            # Cleanup after tests
│   └── README.md                     # Testing documentation
├── docs/                             # Documentation
│   └── REDUCED-MOTION.md             # Accessibility documentation
├── instructions/                     # Implementation guides
├── .github/workflows/                # GitHub Actions CI/CD
│   ├── playwright.yml                # E2E test runner
│   ├── build-plugin.yml              # Build and release pipeline
│   ├── pr-preview.yml                # Preview workflow
│   └── gemini-*.yml                  # AI assistant workflows
├── my-scroll-block.php               # Main WordPress plugin file
├── package.json                      # Node dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── playwright.config.js              # Playwright test configuration
├── webpack.config.js                 # Build configuration
├── blueprint.json                    # WordPress Playground preset
└── .prettierrc                       # Code formatting configuration
```

## Development Commands

All commands run from repository root:

```bash
# Development
npm install                    # Install dependencies
npm start                      # Dev mode with live reload
npm run build                  # Production build

# Code Quality
npm run format                 # Format with Prettier
npm run format:check           # Check formatting
npm run lint:js                # Lint JavaScript (with --fix)
npm run lint:css               # Lint CSS (with --fix)
npm run typecheck              # Validate TypeScript

# Testing
npm test                       # Run tests headless
npm run test:headed            # Run tests with visible browser
npm run test:debug             # Debug mode for tests
npm run test:report            # View HTML test report

# WordPress Playground
npm run playground:start       # Start local WordPress Playground

# Plugin Packaging
npm run plugin-zip             # Create distribution zip
```

## Architecture & Key Concepts

### Block Extension Pattern

The plugin uses WordPress block filters (not creating new block types):

1. **Attribute Registration** (`blocks.registerBlockType` filter): Adds animation attributes to supported blocks
2. **Editor UI** (Higher-order component on `editor.BlockEdit`): Adds SelectControl dropdowns in Inspector sidebar
3. **Output Rendering** (`blocks.getSaveContent.extraProps` filter): Injects CSS classes/data attributes into saved block markup
4. **Editor Preview** (`editor.BlockListBlock` filter): Applies classes in editor canvas for live preview
5. **Animation Indicator** (`editor.BlockListBlock` filter): Adds visual indicator on blocks with animations

### Supported Blocks

```javascript
const SUPPORTED_BLOCKS = [
  'core/image',
  'core/paragraph',
  'core/columns',
  'core/group',
  'core/heading',
];
```

### Animation Types (17 total)

**Entry Animations:**

- `none`, `fade-in`, `slide-in-left`, `slide-in-right`, `slide-in-up`, `slide-in-down`
- `scale-up`, `rotate-in`, `blur-in`, `rotate-3d-in`, `circle-reveal`, `curtain-reveal`

**In-and-Out Animations:**

- `fade-in-out`, `slide-up-in-out`, `scale-in-out`, `rotate-in-out`, `rotate-3d-in-out`

### Animation Timing Presets

- `default` (20% - 100%), `quick` (0% - 50%), `slow` (10% - 100%), `late` (50% - 100%), `custom`

### Block Attributes

Each supported block gains these attributes:

| Attribute             | Type    | Default     | Description                    |
| --------------------- | ------- | ----------- | ------------------------------ |
| `animationType`       | string  | `'none'`    | Selected animation type        |
| `animationRange`      | string  | `'default'` | Timing preset                  |
| `animationEntryStart` | number  | `20`        | Custom entry start (%)         |
| `animationEntryEnd`   | number  | `100`       | Custom entry end (%)           |
| `animationExitStart`  | number  | `0`         | Custom exit start (%)          |
| `animationExitEnd`    | number  | `100`       | Custom exit end (%)            |
| `parallaxEnabled`     | boolean | `false`     | Enable parallax effect         |
| `parallaxStrength`    | number  | `50`        | Parallax displacement strength |

### CSS Classes & Data Attributes

**Frontend output:**

- Class: `scroll-anim-block` - Main animation class
- Class: `scroll-anim-{type}` - Specific animation type (e.g., `scroll-anim-fade-in`)
- Attribute: `data-scroll-anim="1"` - Animation marker
- Attribute: `data-animation-range="{preset}"` - Timing preset
- Attribute: `data-parallax="1"` - Parallax enabled marker

## Key Files & Their Roles

| File                           | Purpose                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `my-scroll-block.php`          | Plugin entry; enqueues assets; `render_block` filter for frontend class injection |
| `src/index.js`                 | Block filters; attribute registration; UI controls; markup manipulation           |
| `src/style.css`                | CSS scroll timeline rules for all animation types                                 |
| `src/editor.css`               | Editor UI styles (animation indicator badge)                                      |
| `src/progress-block/`          | Reading Progress Bar custom block                                                 |
| `tests/scroll-block.spec.ts`   | Main e2e tests for editor and frontend                                            |
| `tests/reduced-motion.spec.ts` | Accessibility tests for reduced motion                                            |
| `tests/global-setup.ts`        | WordPress Playground startup with plugin mounting                                 |

## Testing Architecture

Tests use **Playwright + TypeScript + WordPress Playground**:

- **Base URL**: http://127.0.0.1:9400
- **Browser**: Chromium only
- **Timeout**: 30 seconds per test
- **Global Setup**: Starts WordPress Playground, mounts plugin
- **Blueprint**: `blueprint.json` contains initial data for test environment

### Running Tests

```bash
npm test                                    # Run all tests headless
npm run test:headed                         # Run with visible browser
npm run test:debug                          # Debug mode
npx playwright test -g "test-name-pattern" # Run specific test
```

### Test Coverage

1. Plugin activation verification
2. Animation panel visibility in block editor
3. All animation type selections
4. Block attribute persistence
5. Frontend CSS class application
6. Accessibility (prefers-reduced-motion)

## Code Conventions

### Formatting (Prettier)

- Single quotes
- Trailing commas (ES5)
- 100 character line width
- Semicolons required

### File Structure

- JavaScript uses ES6+ modules
- Tests use TypeScript for type safety
- CSS follows WordPress coding standards

### Commit Messages

- Use conventional commit format when possible
- Include context for what and why

## Making Changes

### Adding a New Animation Type

1. Add option to `ANIMATION_OPTIONS` array in `src/index.js`
2. Add CSS animation keyframes and rules to `src/style.css` using class `.scroll-anim-{type}`
3. Add test case in `tests/scroll-block.spec.ts`
4. Rebuild: `npm run build`

### Modifying Block Support

**Important:** Update BOTH locations when changing supported blocks:

1. `SUPPORTED_BLOCKS` constant in `src/index.js`
2. `$supported_blocks` array in `my-scroll-block.php`

### Editor UI Changes

- Animation selector is in `src/index.js` using `PanelBody` + `SelectControl`
- Animation indicator styles are in `src/editor.css`

### Adding Tests

1. Use TypeScript (run `npm run typecheck` to validate)
2. Ensure WordPress Playground can reach the feature
3. Use page selectors that work with WordPress block editor DOM
4. Add to appropriate spec file or create new one

## Debugging

| Issue            | Solution                                          |
| ---------------- | ------------------------------------------------- |
| Editor issues    | Check browser console; WordPress error logs       |
| Rendering issues | Run `npm run lint:js` and `npm run typecheck`     |
| Test failures    | Run `npm run test:headed` or `npm run test:debug` |
| Build errors     | Check `npm run build` output; verify imports      |
| Port 9400 in use | Kill with `pkill -f "wp-playground"`              |

## CI/CD Workflows

### playwright.yml

- Runs on: push to main/master, PRs
- Runs e2e tests with Chromium
- Uploads HTML report on failure

### build-plugin.yml

- Runs on: push, PR, release, manual
- Lints JS/CSS, builds assets, creates zip
- Auto-uploads to releases on release events

### pr-preview.yml

- Generates WordPress Playground preview links for PRs

## WordPress Playground Testing

### Local Testing

```bash
npm run playground:start
```

This starts a local WordPress instance at http://127.0.0.1:9400 with the plugin auto-mounted and activated.

### Generating Playground Links

For sharing test links with changes from a branch:

```
https://playground.wordpress.net/#{%22steps%22:[{%22step%22:%22installPlugin%22,%22pluginData%22:{%22resource%22:%22git:directory%22,%22url%22:%22https://github.com/fellyph/scrolldriven-block%22,%22ref%22:%22BRANCH_NAME%22,%22refType%22:%22branch%22},%22options%22:{%22activate%22:true}}]}
```

Replace `BRANCH_NAME` with the actual branch.

## Important Notes

- **No frontend JavaScript**: All animations are CSS scroll timeline-based
- **Sync PHP and JS**: Changes to block support in `src/index.js` must be mirrored in `my-scroll-block.php`
- **Browser support**: CSS scroll timelines are modern features - check [Can I Use](https://caniuse.com/?search=scroll-timeline)
- **Accessibility**: The `prefers-reduced-motion` media query disables all animations automatically
- **Build before test**: Always run `npm run build` after source changes before testing

## Quick Reference

```bash
# Full development cycle
npm install
npm run build
npm test

# Quick iteration
npm start          # Watch mode
npm run playground:start  # Test in WordPress

# Before committing
npm run format
npm run lint:js
npm run lint:css
npm run typecheck
npm test
```
