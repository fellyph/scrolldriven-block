# Playwright Tests for My Scroll Block

This directory contains end-to-end tests for the My Scroll Block WordPress plugin using Playwright, TypeScript, and WordPress Playground.

## Setup

### Prerequisites
- Node.js (LTS version)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Chromium browser (only needed once):
```bash
npx playwright install --with-deps chromium
```

## Running Tests

### Run all tests (headless):
```bash
npm test
```

### Run tests with visible browser:
```bash
npm run test:headed
```

### Run tests in debug mode:
```bash
npm run test:debug
```

### View test report:
```bash
npx playwright show-report
```

## Test Structure

The tests are organized into the following groups:

### 1. WordPress Playground Setup
- Verifies WordPress loads correctly
- Checks plugin activation status

### 2. Block Editor - Scroll Animation Panel
- Tests Scroll Animation panel visibility
- Verifies animation type options
- Tests applying animations to blocks

### 3. Frontend - Scroll Animation Rendering
- Validates scroll animation classes on frontend
- Tests multiple animation types
- Verifies CSS styles are loaded

### 4. Plugin Compatibility
- Checks WordPress version compatibility

## How It Works

1. **Global Setup** (`global-setup.ts`): Starts WordPress Playground server with the plugin mounted and activated
2. **Tests Run**: Execute against the running WordPress instance (written in TypeScript)
3. **Global Teardown** (`global-teardown.ts`): Stops the WordPress Playground server

## WordPress Playground Configuration

The tests use WordPress Playground CLI to spin up a temporary WordPress instance with:
- PHP 8.3
- Latest WordPress version
- Auto-login enabled
- Plugin automatically activated
- Demo content created

## Continuous Integration

Tests run automatically on GitHub Actions for every push and pull request. The CI workflow:
- Uses Ubuntu latest
- Installs Node.js LTS
- Installs only Chromium browser
- Runs tests
- Uploads HTML report on failure

## Troubleshooting

### Port already in use
If port 9400 is already in use, you'll need to stop any existing WordPress Playground instances:
```bash
pkill -f "wp-playground"
```

### Tests timing out
Increase the timeout in `playwright.config.ts`:
```typescript
timeout: 60000, // 60 seconds
```

### Browser not installed
Run the install command:
```bash
npx playwright install --with-deps chromium
```

## Writing New Tests

When adding new tests:
1. Use TypeScript for type safety
2. Use descriptive test names
3. Follow the existing test structure
4. Clean up any created content if needed
5. Use Page Object Model for complex interactions
6. Keep tests independent and isolated
7. Run `npm run typecheck` to validate TypeScript

### TypeScript Support

Tests are written in TypeScript for better type safety and IDE support. Benefits include:
- Type checking for Playwright APIs
- Better autocomplete in your editor
- Catch errors before running tests
- Improved code documentation

Run type checking:
```bash
npm run typecheck
```

## Animation Types Tested

- None
- Fade In
- Slide In Left
- Slide In Right
- Slide In Up
- Slide In Down
- Scale Up
- Rotate In

