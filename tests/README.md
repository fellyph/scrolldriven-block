# Playwright Tests for My Scroll Block

This directory contains end-to-end tests for the My Scroll Block WordPress plugin using Playwright, TypeScript, and WordPress Playground.

## Recent Improvements (November 2025)

The test suite has been significantly enhanced for reliability and robustness:

### 🎯 Selector Improvements

- **Role-based selectors**: Prioritized `getByRole`, `getByLabel`, and `getByText` over brittle CSS selectors
- **Resilient selectors**: Updated to be resistant to minor DOM structure changes
- **Proper timeout handling**: All selectors now include appropriate timeout values

### ⏱️ Enhanced Wait Strategies

- **Explicit waits**: Replaced arbitrary `waitForTimeout()` with proper `waitFor()` conditions
- **State verification**: Added `state: 'visible'` and `state: 'attached'` checks before interactions
- **Better error handling**: Removed `.catch(() => false)` patterns that hide real issues

### 🔧 Helper Functions

Added reusable helper functions to reduce duplication and improve maintainability:

- `closeWelcomeDialog()`: Handles welcome dialog with proper wait conditions
- `getEditorFrame()`: Ensures editor frame is ready before use
- `navigateToPostEditor()`: Combines navigation and setup steps
- `addParagraphBlock()`: Creates paragraph blocks consistently
- `setPostTitle()`: Sets post titles with proper waits
- `selectAnimationType()`: Selects animation types reliably
- `publishPost()`: Handles the full publish workflow
- `getPublishedPostUrl()`: Retrieves post URLs safely

### ✅ Comprehensive Assertions

- **Attribute verification**: Checks for `data-scroll-anim`, `data-anim-range`, etc.
- **Class validation**: Verifies both base and specific animation classes
- **Content assertions**: Ensures text content is rendered correctly
- **Visibility checks**: Confirms elements are actually visible to users

### 🆕 New Test Coverage

- **Animation timing options**: Tests for custom timing controls
- **Parallax feature**: Validates parallax effect functionality
- **Editor interactions**: Tests clicking animation indicators
- **State transitions**: Verifies animation removal when set to "None"

### ⚙️ Configuration Updates

- Increased timeouts for more reliable execution
- Added screenshot and video capture on failure
- Enhanced trace collection for debugging
- Better timeout configurations for actions and navigation

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

### Run specific test file:

```bash
npx playwright test scroll-block.spec.ts
```

### Run specific test by name:

```bash
npx playwright test -g "should show Scroll Animation panel"
```

## Test Structure

The tests are organized into the following groups:

### 1. WordPress Playground Setup

- Verifies WordPress loads correctly
- Checks plugin activation status

### 2. Block Editor - Scroll Animation Panel

- Tests Scroll Animation panel visibility
- Verifies animation type options (17+ animation types)
- Tests applying animations to blocks
- Validates animation timing controls
- Tests custom timing ranges

### 3. Frontend - Scroll Animation Rendering

- Validates scroll animation classes on frontend
- Tests multiple animation types
- Verifies CSS styles are loaded
- Tests custom timing data attributes

### 4. Plugin Compatibility

- Checks WordPress version compatibility (6.7+)

### 5. Editor Interactions

- Tests animation indicator functionality
- Validates clicking indicators to open settings
- Tests indicator removal when animation is disabled

### 6. Parallax Feature

- Tests parallax effect enablement
- Validates parallax strength controls
- Verifies parallax data attributes on frontend

## Best Practices

When writing or maintaining tests, follow these guidelines:

### ✅ DO

- Use role-based selectors (`getByRole`, `getByLabel`, `getByText`)
- Include explicit timeouts with `waitFor()` methods
- Use helper functions to avoid code duplication
- Add comprehensive assertions (classes, attributes, content)
- Wait for elements to be in the correct state before interacting
- Use TypeScript types for better IDE support
- Keep tests independent and isolated

### ❌ DON'T

- Use brittle CSS selectors (`.className > div:nth-child(2)`)
- Use arbitrary `waitForTimeout()` delays
- Suppress errors with `.catch(() => false)` without handling
- Make assumptions about timing or element readiness
- Create tests that depend on other tests' state
- Skip TypeScript type checking

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
- Demo content created for testing

## Continuous Integration

Tests run automatically on GitHub Actions for every push and pull request. The CI workflow:

- Uses Ubuntu latest
- Installs Node.js LTS
- Installs only Chromium browser
- Runs tests with retries (2 retries on CI)
- Uploads HTML report on failure
- Captures screenshots and videos on failure

## Troubleshooting

### Port already in use

If port 9400 is already in use, you'll need to stop any existing WordPress Playground instances:

```bash
pkill -f "wp-playground"
```

### Tests timing out

The configuration has been updated with appropriate timeouts:

- Action timeout: 10 seconds
- Navigation timeout: 15 seconds
- Test timeout: 60 seconds
- Expect timeout: 10 seconds

If you still experience timeouts, check your network connection or system resources.

### Browser not installed

Run the install command:

```bash
npx playwright install --with-deps chromium
```

### WordPress Playground fails to start

This usually means:

1. No internet connection (Playground needs to download WordPress)
2. Port 9400 is already in use
3. Insufficient disk space

Check the console output for specific error messages.

## Writing New Tests

When adding new tests:

1. **Use TypeScript** for type safety and better IDE support
2. **Use helper functions** when available to reduce duplication
3. **Follow naming conventions**: Use descriptive, action-based names
4. **Add proper waits**: Always wait for elements to be ready before interacting
5. **Use role-based selectors** where possible
6. **Add comprehensive assertions**: Check classes, attributes, and content
7. **Keep tests isolated**: Don't depend on other tests' state
8. **Run type checking**: `npm run typecheck` before committing
9. **Test locally first**: Run tests in headed mode to debug issues

### Example Test Structure

```typescript
test('should do something specific', async ({ page }: { page: Page }) => {
  // Setup
  await navigateToPostEditor(page);
  const editorFrame = await getEditorFrame(page);

  // Action
  await addParagraphBlock(editorFrame, 'Test content');
  await selectAnimationType(page, 'Fade In');

  // Assertion
  const indicator = editorFrame.locator('.scroll-anim-indicator');
  await expect(indicator).toBeVisible({ timeout: 5000 });
});
```

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

The test suite covers all available animation types:

**Entry Animations:**

- None
- Fade In
- Slide In Left
- Slide In Right
- Slide In Up
- Slide In Down
- Scale Up
- Rotate In
- Blur In
- 3D Rotate In
- Circle Reveal
- Curtain Reveal

**Entry & Exit Animations:**

- 🔄 Fade In & Out
- 🔄 Slide Up In & Out
- 🔄 Scale In & Out
- 🔄 Rotate In & Out
- 🔄 3D Rotate In & Out

## Debugging Failed Tests

When a test fails, Playwright provides several debugging tools:

### 1. View HTML Report

```bash
npm run test:report
```

### 2. Screenshots

Screenshots are automatically captured on failure in `test-results/`

### 3. Videos

Videos are retained on failure for detailed playback

### 4. Traces

Traces are collected on first retry. View them at:

```bash
npx playwright show-trace test-results/.../trace.zip
```

### 5. Debug Mode

Run tests with Playwright Inspector:

```bash
npm run test:debug
```

This allows you to:

- Step through tests line by line
- Inspect the DOM at each step
- See network requests
- Evaluate selectors in real-time

## Contributing

When contributing test improvements:

1. Follow the existing code structure and style
2. Add helper functions for repeated actions
3. Use TypeScript types consistently
4. Include proper error messages in assertions
5. Document complex test logic with comments
6. Run all checks before committing:
   - `npm run typecheck`
   - `npm run lint:js`
   - `npm run format`
   - `npm test`

## Related Files

- `scroll-block.spec.ts`: Main test file with all test cases
- `global-setup.ts`: WordPress Playground initialization
- `global-teardown.ts`: Cleanup and server shutdown
- `../playwright.config.js`: Playwright configuration
- `../tsconfig.json`: TypeScript configuration
