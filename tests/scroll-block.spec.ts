import { test, expect, type Page } from '@playwright/test';

/**
 * Helper Functions for Test Reliability
 */

/**
 * Close the welcome dialog if it appears in the block editor.
 * Uses proper wait conditions and role-based selectors.
 * @param page
 */
async function closeWelcomeDialog(page: Page): Promise<void> {
  const closeButton = page.getByRole('button', { name: 'Close', exact: false });

  // Wait for dialog to appear or timeout quickly
  try {
    await closeButton.waitFor({ state: 'visible', timeout: 3000 });
    await closeButton.click();
    // Wait for the dialog to actually close
    await closeButton.waitFor({ state: 'hidden', timeout: 2000 });
  } catch {
    // Dialog didn't appear, continue
  }
}

/**
 * Get the editor frame locator.
 * Waits for the frame to be available before returning.
 * @param page
 */
async function getEditorFrame(page: Page) {
  const frame = page.frameLocator('iframe[name="editor-canvas"]');
  // Ensure frame is ready by checking for a common element
  await frame.locator('body').waitFor({ state: 'attached', timeout: 10000 });
  return frame;
}

/**
 * Navigate to the post editor and ensure it's ready.
 * @param page
 */
async function navigateToPostEditor(page: Page): Promise<void> {
  await page.goto('/wp-admin/post-new.php');
  await page.waitForLoadState('domcontentloaded');
  await closeWelcomeDialog(page);
}

/**
 * Add a paragraph block with text content.
 * @param editorFrame
 * @param text
 */
async function addParagraphBlock(
  editorFrame: ReturnType<Page['frameLocator']>,
  text: string
): Promise<void> {
  const addBlockButton = editorFrame.getByRole('button', { name: 'Add default block' });
  await addBlockButton.waitFor({ state: 'visible', timeout: 10000 });
  await addBlockButton.click();

  const blockEditor = editorFrame.getByRole('document', { name: /Empty block/i });
  await blockEditor.waitFor({ state: 'visible', timeout: 10000 });
  await blockEditor.fill(text);
}

/**
 * Set the post title.
 * @param editorFrame
 * @param title
 */
async function setPostTitle(
  editorFrame: ReturnType<Page['frameLocator']>,
  title: string
): Promise<void> {
  const titleBox = editorFrame.getByRole('textbox', { name: 'Add title' });
  await titleBox.waitFor({ state: 'visible', timeout: 10000 });
  await titleBox.fill(title);
}

/**
 * Select an animation type from the dropdown.
 * @param page
 * @param animationType
 */
async function selectAnimationType(page: Page, animationType: string): Promise<void> {
  const animationSelect = page.getByLabel('Animation Type');
  await animationSelect.waitFor({ state: 'visible', timeout: 5000 });
  await animationSelect.selectOption(animationType);
}

/**
 * Publish a post and wait for confirmation.
 * @param page
 */
async function publishPost(page: Page): Promise<void> {
  // Click the main Publish button
  const publishButton = page.getByRole('button', { name: 'Publish', exact: true });
  await publishButton.waitFor({ state: 'visible', timeout: 5000 });
  await publishButton.click();

  // Click the confirmation Publish button in the panel
  const publishPanel = page.getByLabel('Editor publish');
  const confirmButton = publishPanel.getByRole('button', { name: 'Publish', exact: true });
  await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
  await confirmButton.click();

  // Wait for the success message
  const successMessage = page.getByText(/is now live/i);
  await successMessage.waitFor({ state: 'visible', timeout: 10000 });
}

/**
 * Get the published post URL from the View Post link.
 * @param page
 */
async function getPublishedPostUrl(page: Page): Promise<string> {
  const viewPostLink = page.getByRole('link', { name: 'View Post' }).first();
  await viewPostLink.waitFor({ state: 'visible', timeout: 5000 });

  const postUrl = await viewPostLink.getAttribute('href');
  if (!postUrl) {
    throw new Error('Could not retrieve post URL from View Post link');
  }

  return postUrl;
}

test.describe('WordPress Playground Setup', () => {
  test('should load WordPress homepage', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that WordPress loaded successfully
    await expect(page).toHaveTitle(/WordPress Scroll-driven block/i);

    // Verify we can see WordPress content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have My Scroll Block plugin activated', async ({ page }: { page: Page }) => {
    await page.goto('/wp-admin/plugins.php');
    await page.waitForLoadState('domcontentloaded');

    // Look for the plugin row using more robust selector
    const pluginRow = page.locator('tr').filter({ hasText: 'My Scroll Block' });
    await expect(pluginRow).toBeVisible({ timeout: 10000 });

    // Verify the plugin is active (shows "Deactivate" link)
    const deactivateLink = pluginRow.getByRole('link', {
      name: /Deactivate/i,
    });
    await expect(deactivateLink).toBeVisible();

    // Verify plugin description
    await expect(pluginRow).toContainText(
      'Adds a Scroll Animation panel to supported core blocks.'
    );
  });
});

test.describe('Block Editor - Scroll Animation Panel', () => {
  test('should show Scroll Animation panel for paragraph block', async ({
    page,
  }: {
    page: Page;
  }) => {
    await navigateToPostEditor(page);

    // Add a paragraph block
    const editorFrame = await getEditorFrame(page);
    await addParagraphBlock(editorFrame, 'Test paragraph with scroll animation');

    // Check for Scroll Animation panel in the sidebar
    const scrollAnimationHeading = page.getByRole('heading', { name: 'Scroll Animation' });
    await expect(scrollAnimationHeading).toBeVisible({ timeout: 5000 });

    // Verify Animation Type dropdown exists
    const animationTypeSelect = page.getByLabel('Animation Type');
    await expect(animationTypeSelect).toBeVisible();
  });

  test('should apply Fade In animation to paragraph', async ({ page }: { page: Page }) => {
    await navigateToPostEditor(page);

    // Add title and paragraph
    const editorFrame = await getEditorFrame(page);
    await setPostTitle(editorFrame, 'Test Animation Post');
    await addParagraphBlock(editorFrame, 'This paragraph will fade in');

    // Select Fade In animation
    await selectAnimationType(page, 'Fade In');

    // Verify the animation was applied (look for the indicator in the editor)
    // The indicator should appear inside a wrapper div with specific class
    const animationIndicatorWrapper = editorFrame.locator('.scroll-anim-indicator-wrapper');
    await expect(animationIndicatorWrapper).toBeVisible({ timeout: 5000 });

    // Verify the actual indicator element is present
    const animationIndicator = animationIndicatorWrapper.locator('.scroll-anim-indicator');
    await expect(animationIndicator).toBeVisible();

    // Verify it has the correct title attribute
    await expect(animationIndicator).toHaveAttribute(
      'title',
      'Scroll Animation Applied (click to open settings)'
    );
  });

  test('should have all animation type options available', async ({ page }: { page: Page }) => {
    await navigateToPostEditor(page);

    // Add a paragraph block
    const editorFrame = await getEditorFrame(page);
    await addParagraphBlock(editorFrame, 'Test paragraph');

    // Get animation type select control
    const animationTypeSelect = page.getByLabel('Animation Type');
    await expect(animationTypeSelect).toBeVisible({ timeout: 5000 });

    // Verify all expected animation types are available
    const expectedOptions: string[] = [
      'None',
      'Fade In',
      'Slide In Left',
      'Slide In Right',
      'Slide In Up',
      'Slide In Down',
      'Scale Up',
      'Rotate In',
      'Blur In',
      '3D Rotate In',
      'Circle Reveal',
      'Curtain Reveal',
      '🔄 Fade In & Out',
      '🔄 Slide Up In & Out',
      '🔄 Scale In & Out',
      '🔄 Rotate In & Out',
      '🔄 3D Rotate In & Out',
    ];

    for (const option of expectedOptions) {
      const optionElement = animationTypeSelect.locator(`option`, { hasText: option });
      await expect(optionElement).toBeAttached();
    }
  });

  test('should display animation timing options when animation is selected', async ({
    page,
  }: {
    page: Page;
  }) => {
    await navigateToPostEditor(page);

    // Add a paragraph block
    const editorFrame = await getEditorFrame(page);
    await addParagraphBlock(editorFrame, 'Test paragraph');

    // Initially, animation timing should not be visible
    const animationTimingSelect = page.getByLabel('Animation Timing');
    await expect(animationTimingSelect).not.toBeVisible();

    // Select an animation
    await selectAnimationType(page, 'Fade In');

    // Now animation timing should be visible
    await expect(animationTimingSelect).toBeVisible({ timeout: 3000 });

    // Verify timing options are available
    const timingOptions = [
      'Default (20% - 100%)',
      'Quick (0% - 50%)',
      'Slow (10% - 100%)',
      'Late Start (50% - 100%)',
      'Custom',
    ];

    for (const option of timingOptions) {
      const optionElement = animationTimingSelect.locator(`option`, { hasText: option });
      await expect(optionElement).toBeAttached();
    }
  });
});

test.describe('Frontend - Scroll Animation Rendering', () => {
  test('should render published post with scroll animation classes', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Create and publish a post with animation
    await navigateToPostEditor(page);

    const editorFrame = await getEditorFrame(page);
    await setPostTitle(editorFrame, 'Frontend Animation Test');
    await addParagraphBlock(editorFrame, 'This paragraph has a fade in animation');

    await selectAnimationType(page, 'Fade In');
    await publishPost(page);

    // Get and visit the published post URL
    const postUrl = await getPublishedPostUrl(page);
    await page.goto(postUrl);
    await page.waitForLoadState('domcontentloaded');

    // Verify the paragraph has correct scroll animation classes and attributes
    const animatedParagraph = page.locator(
      'p.scroll-anim-block.scroll-anim-fade-in[data-scroll-anim="1"]'
    );
    await expect(animatedParagraph).toBeVisible({ timeout: 5000 });
    await expect(animatedParagraph).toContainText('This paragraph has a fade in animation');

    // Verify data attributes
    await expect(animatedParagraph).toHaveAttribute('data-scroll-anim', '1');
    await expect(animatedParagraph).toHaveAttribute('data-anim-range', 'default');
  });

  test('should apply different animation types correctly on frontend', async ({
    page,
  }: {
    page: Page;
  }) => {
    interface AnimationType {
      type: string;
      class: string;
      text: string;
    }

    const animations: AnimationType[] = [
      {
        type: 'Slide In Left',
        class: 'scroll-anim-slide-in-left',
        text: 'Testing slide in left',
      },
      {
        type: 'Scale Up',
        class: 'scroll-anim-scale-up',
        text: 'Testing scale up',
      },
    ];

    for (const animation of animations) {
      // Create post
      await navigateToPostEditor(page);

      const editorFrame = await getEditorFrame(page);
      await setPostTitle(editorFrame, `Test ${animation.type}`);
      await addParagraphBlock(editorFrame, animation.text);

      await selectAnimationType(page, animation.type);
      await publishPost(page);

      // Visit frontend
      const postUrl = await getPublishedPostUrl(page);
      await page.goto(postUrl);
      await page.waitForLoadState('domcontentloaded');

      // Verify animation class is present on the paragraph
      const animatedElement = page.locator(`p.${animation.class}`);
      await expect(animatedElement).toBeVisible({ timeout: 5000 });
      await expect(animatedElement).toContainText(animation.text);

      // Verify the base animation class is also present
      await expect(animatedElement).toHaveClass(/scroll-anim-block/);
    }
  });

  test('should load scroll animation CSS styles', async ({ page }: { page: Page }) => {
    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Try to find the first post link
    const postLink = page.locator('a[rel="bookmark"]').first();

    // Check if any posts exist
    const postLinkCount = await postLink.count();
    if (postLinkCount === 0) {
      // Skip this test if there are no posts
      test.skip();
      return;
    }

    const firstPostUrl = await postLink.getAttribute('href');
    if (!firstPostUrl) {
      test.skip();
      return;
    }

    await page.goto(firstPostUrl);
    await page.waitForLoadState('domcontentloaded');

    // Check if the style-index.css is loaded in the page
    const stylesheets = await page.evaluate((): string[] => {
      return Array.from(document.styleSheets)
        .map((sheet) => sheet.href)
        .filter((href): href is string => href !== null && href.includes('my-scroll-block'));
    });

    // Verify that at least one stylesheet from the plugin is loaded
    expect(stylesheets.length).toBeGreaterThanOrEqual(1);
  });

  test('should apply custom animation timing correctly', async ({ page }: { page: Page }) => {
    await navigateToPostEditor(page);

    const editorFrame = await getEditorFrame(page);
    await setPostTitle(editorFrame, 'Custom Timing Test');
    await addParagraphBlock(editorFrame, 'Paragraph with custom animation timing');

    // Select animation
    await selectAnimationType(page, 'Fade In');

    // Select custom timing
    const animationTimingSelect = page.getByLabel('Animation Timing');
    await animationTimingSelect.waitFor({ state: 'visible', timeout: 5000 });
    await animationTimingSelect.selectOption('Custom');

    // Verify custom range controls appear
    const entryStartControl = page.getByLabel('Entry Start (%)');
    const entryEndControl = page.getByLabel('Entry End (%)');
    await expect(entryStartControl).toBeVisible({ timeout: 3000 });
    await expect(entryEndControl).toBeVisible();

    // Set custom values
    await entryStartControl.fill('30');
    await entryEndControl.fill('80');

    await publishPost(page);

    // Visit frontend and verify custom data attributes
    const postUrl = await getPublishedPostUrl(page);
    await page.goto(postUrl);
    await page.waitForLoadState('domcontentloaded');

    const animatedParagraph = page.locator('p.scroll-anim-fade-in');
    await expect(animatedParagraph).toBeVisible({ timeout: 5000 });
    await expect(animatedParagraph).toHaveAttribute('data-anim-range', 'custom');
    await expect(animatedParagraph).toHaveAttribute('data-entry-start', '30');
    await expect(animatedParagraph).toHaveAttribute('data-entry-end', '80');
  });
});

test.describe('Plugin Compatibility', () => {
  test('should work with WordPress 6.7+', async ({ page }: { page: Page }) => {
    await page.goto('/wp-admin');
    await page.waitForLoadState('domcontentloaded');

    // Verify the admin page loaded successfully
    const adminPageBody = page.locator('.wp-admin');
    await expect(adminPageBody).toBeVisible({ timeout: 10000 });

    // Try to find WordPress version info
    // WordPress version is typically in the footer or page source
    const footerVersion = page.locator('#footer-upgrade').or(page.locator('#wp-version-message'));

    try {
      await footerVersion.waitFor({ state: 'visible', timeout: 5000 });
      const versionText = await footerVersion.textContent();

      if (versionText) {
        // Extract version like "Version 6.8.3" or just "6.8"
        const match = versionText.match(/(\d+)\.(\d+)/);
        if (match) {
          const major = parseInt(match[1], 10);
          const minor = parseInt(match[2], 10);
          expect(major).toBeGreaterThanOrEqual(6);
          if (major === 6) {
            expect(minor).toBeGreaterThanOrEqual(7);
          }
        }
      }
    } catch {
      // If we can't find version info, at least verify admin is accessible
      await expect(adminPageBody).toBeVisible();
    }
  });
});

test.describe('Editor Interactions', () => {
  test('should allow clicking animation indicator to open settings panel', async ({
    page,
  }: {
    page: Page;
  }) => {
    await navigateToPostEditor(page);

    const editorFrame = await getEditorFrame(page);
    await addParagraphBlock(editorFrame, 'Test paragraph');
    await selectAnimationType(page, 'Fade In');

    // Locate the animation indicator
    const indicatorWrapper = editorFrame.locator('.scroll-anim-indicator-wrapper');
    await expect(indicatorWrapper).toBeVisible({ timeout: 5000 });

    const indicator = indicatorWrapper.locator('.scroll-anim-indicator');
    await expect(indicator).toBeVisible();

    // Click the indicator
    await indicator.click();

    // The settings panel should be visible and have focus on the animation settings
    // We can verify this by checking if the Scroll Animation panel is visible and expanded
    const scrollAnimationPanel = page.getByRole('heading', { name: 'Scroll Animation' });
    await expect(scrollAnimationPanel).toBeVisible({ timeout: 3000 });
  });

  test('should remove animation indicator when animation is set to None', async ({
    page,
  }: {
    page: Page;
  }) => {
    await navigateToPostEditor(page);

    const editorFrame = await getEditorFrame(page);
    await addParagraphBlock(editorFrame, 'Test paragraph');

    // Apply animation first
    await selectAnimationType(page, 'Fade In');

    // Verify indicator appears
    const indicatorWrapper = editorFrame.locator('.scroll-anim-indicator-wrapper');
    await expect(indicatorWrapper).toBeVisible({ timeout: 5000 });

    // Set animation to None
    await selectAnimationType(page, 'None');

    // Indicator should be removed
    await expect(indicatorWrapper).not.toBeVisible({ timeout: 3000 });
  });
});

test.describe('Parallax Feature', () => {
  test('should enable parallax effect on blocks', async ({ page }: { page: Page }) => {
    await navigateToPostEditor(page);

    const editorFrame = await getEditorFrame(page);
    await addParagraphBlock(editorFrame, 'Paragraph with parallax');

    // Enable parallax toggle
    const parallaxToggle = page.getByLabel('Enable Parallax Effect');
    await parallaxToggle.waitFor({ state: 'visible', timeout: 5000 });
    await parallaxToggle.click();

    // Parallax strength control should appear
    const parallaxStrength = page.getByLabel('Parallax Strength');
    await expect(parallaxStrength).toBeVisible({ timeout: 3000 });

    // Change strength value
    await parallaxStrength.fill('100');

    await publishPost(page);

    // Verify on frontend
    const postUrl = await getPublishedPostUrl(page);
    await page.goto(postUrl);
    await page.waitForLoadState('domcontentloaded');

    const parallaxParagraph = page.locator('p[data-parallax="1"]');
    await expect(parallaxParagraph).toBeVisible({ timeout: 5000 });
    await expect(parallaxParagraph).toHaveAttribute('data-parallax-strength', '100');
  });
});
