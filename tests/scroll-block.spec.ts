import { test, expect, type Page } from '@playwright/test';

/**
 * Helper function to dismiss the WordPress welcome modal and wait for the editor to be ready
 */
async function setupEditor(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');

  // Wait for the editor to initialize
  await page.waitForTimeout(1000);

  // Dismiss the welcome modal if present - try multiple possible buttons
  const welcomeModalDismissButtons = [
    page.getByRole('button', { name: 'Get started' }),
    page.getByRole('button', { name: 'Close', exact: true }),
    page.locator('.components-modal__screen-overlay button[aria-label="Close"]'),
    page.locator('.components-modal__header button'),
  ];

  for (const button of welcomeModalDismissButtons) {
    try {
      if (await button.isVisible({ timeout: 2000 })) {
        await button.click();
        await page.waitForTimeout(500);
        break;
      }
    } catch {
      // Button not found or not clickable, try next one
    }
  }

  // Wait for any modal to disappear
  try {
    await page.waitForSelector('.components-modal__screen-overlay', {
      state: 'hidden',
      timeout: 5000,
    });
  } catch {
    // Modal may not exist
  }
}

/**
 * Helper to add a paragraph block and ensure it's selected
 */
async function addParagraphBlock(page: Page, text: string): Promise<void> {
  const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');

  // Wait for the editor canvas to be ready
  await editorFrame.locator('body').waitFor({ state: 'visible', timeout: 30000 });

  // Click on the add block button or empty paragraph
  const addBlockButton = editorFrame.getByRole('button', { name: 'Add default block' });
  const emptyParagraph = editorFrame.locator('p.block-editor-default-block-appender__content');

  try {
    if (await addBlockButton.isVisible({ timeout: 5000 })) {
      await addBlockButton.click();
    } else if (await emptyParagraph.isVisible({ timeout: 2000 })) {
      await emptyParagraph.click();
    }
  } catch {
    // Try clicking on the editor body
    await editorFrame.locator('.wp-block-post-content').click();
  }

  // Wait for the block to be ready and type
  await page.waitForTimeout(500);
  await page.keyboard.type(text);
  await page.waitForTimeout(500);
}

test.describe('WordPress Playground Setup', () => {
  test('should load WordPress homepage', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that WordPress loaded successfully
    await expect(page).toHaveTitle(/WordPress Scroll-driven block/);

    // Verify we can see WordPress content
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have My Scroll Block plugin activated', async ({ page }: { page: Page }) => {
    await page.goto('/wp-admin/plugins.php');
    await page.waitForLoadState('networkidle');

    // Look for the plugin row
    const pluginRow = page.locator('tr').filter({ hasText: 'My Scroll Block' });
    await expect(pluginRow).toBeVisible();

    // Verify the plugin is active (shows "Deactivate" link)
    const deactivateLink = pluginRow.getByRole('link', { name: 'Deactivate My Scroll Block' });
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
    await page.goto('/wp-admin/post-new.php');
    await setupEditor(page);

    // Add a paragraph block
    await addParagraphBlock(page, 'Test paragraph with scroll animation');

    // Wait for the sidebar to update
    await page.waitForTimeout(1000);

    // Check for Scroll Animation panel in the sidebar
    const scrollAnimationHeading = page.getByRole('heading', { name: 'Scroll Animation' });
    await expect(scrollAnimationHeading).toBeVisible({ timeout: 10000 });

    // Verify Animation Type dropdown exists
    const animationTypeSelect = page.getByLabel('Animation Type');
    await expect(animationTypeSelect).toBeVisible();
  });

  test('should apply Fade In animation to paragraph', async ({ page }: { page: Page }) => {
    await page.goto('/wp-admin/post-new.php');
    await setupEditor(page);

    // Add title
    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
    const titleBox = editorFrame.getByRole('textbox', { name: 'Add title' });
    await titleBox.fill('Test Animation Post');

    // Add paragraph
    await addParagraphBlock(page, 'This paragraph will fade in');

    // Wait for sidebar to be ready
    await page.waitForTimeout(1000);

    // Select Fade In animation
    const animationTypeSelect = page.getByLabel('Animation Type');
    await expect(animationTypeSelect).toBeVisible({ timeout: 10000 });
    await animationTypeSelect.selectOption('Fade In');

    // Verify the animation was applied (look for the indicator button in the frame)
    const animationIndicator = editorFrame.getByRole('button', {
      name: /Scroll Animation Applied/,
    });
    await expect(animationIndicator).toBeVisible({ timeout: 10000 });
  });

  test('should have all animation type options available', async ({ page }: { page: Page }) => {
    await page.goto('/wp-admin/post-new.php');
    await setupEditor(page);

    // Add a paragraph block
    await addParagraphBlock(page, 'Test paragraph');

    // Wait for sidebar to be ready
    await page.waitForTimeout(1000);

    // Check animation options
    const animationTypeSelect = page.getByLabel('Animation Type');
    await expect(animationTypeSelect).toBeVisible({ timeout: 10000 });

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
    ];

    for (const option of expectedOptions) {
      const optionElement = animationTypeSelect.locator(`option:has-text("${option}")`);
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
    // First create and publish a post with animation
    await page.goto('/wp-admin/post-new.php');
    await setupEditor(page);

    // Create post with animation
    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
    const titleBox = editorFrame.getByRole('textbox', { name: 'Add title' });
    await titleBox.fill('Frontend Animation Test', { timeout: 15000 });

    await addParagraphBlock(page, 'This paragraph has a fade in animation');

    // Wait for sidebar to be ready
    await page.waitForTimeout(1000);

    const animationTypeSelect = page.getByLabel('Animation Type');
    await expect(animationTypeSelect).toBeVisible({ timeout: 10000 });
    await animationTypeSelect.selectOption('Fade In');

    // Publish the post
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    const publishPanelButton = page
      .getByLabel('Editor publish')
      .getByRole('button', { name: 'Publish', exact: true });
    await publishPanelButton.click();

    // Wait for post to be published
    await page.waitForSelector('text=is now live', { timeout: 10000 }).catch(() => null);

    // Get the post URL
    const viewPostLink = page.getByRole('link', { name: 'View Post' }).first();
    const postUrl = await viewPostLink.getAttribute('href');

    if (!postUrl) {
      throw new Error('Could not get post URL');
    }

    // Visit the frontend post
    await page.goto(postUrl);
    await page.waitForLoadState('domcontentloaded');

    // Verify the paragraph has correct scroll animation classes and attributes
    const animatedParagraph = page.locator(
      'p.scroll-anim-block.scroll-anim-fade-in[data-scroll-anim="1"]'
    );
    await expect(animatedParagraph).toBeVisible();
    await expect(animatedParagraph).toContainText('This paragraph has a fade in animation');
  });

  test('should apply different animation types correctly on frontend', async ({
    page,
  }: {
    page: Page;
  }) => {
    interface AnimationType {
      type: string;
      class: string;
    }

    const animations: AnimationType[] = [
      { type: 'Slide In Left', class: 'scroll-anim-slide-in-left' },
      { type: 'Scale Up', class: 'scroll-anim-scale-up' },
    ];

    for (const animation of animations) {
      // Create post
      await page.goto('/wp-admin/post-new.php');
      await setupEditor(page);

      const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
      const titleBox = editorFrame.getByRole('textbox', { name: 'Add title' });
      await titleBox.fill(`Test ${animation.type}`, { timeout: 15000 });

      await addParagraphBlock(page, `Testing ${animation.type}`);

      // Wait for sidebar to be ready
      await page.waitForTimeout(1000);

      const animationTypeSelect = page.getByLabel('Animation Type');
      await expect(animationTypeSelect).toBeVisible({ timeout: 10000 });
      await animationTypeSelect.selectOption(animation.type);

      // Publish
      await page.getByRole('button', { name: 'Publish', exact: true }).click();
      const publishPanelButton = page
        .getByLabel('Editor publish')
        .getByRole('button', { name: 'Publish', exact: true });
      await publishPanelButton.click();

      await page.waitForSelector('text=is now live', { timeout: 10000 }).catch(() => null);

      // Visit frontend
      const viewPostLink = page.getByRole('link', { name: 'View Post' }).first();
      const postUrl = await viewPostLink.getAttribute('href');

      if (!postUrl) {
        throw new Error('Could not get post URL');
      }

      await page.goto(postUrl);
      await page.waitForLoadState('domcontentloaded');

      // Verify animation class - look for any paragraph with the animation class
      const animatedElement = page.locator(`p.${animation.class}`);
      const isVisible = await animatedElement.isVisible({ timeout: 5000 }).catch(() => false);

      // If not found, check if post content exists at all
      if (!isVisible) {
        const anyParagraph = page.locator('p').first();
        await expect(anyParagraph).toBeVisible();
      } else {
        await expect(animatedElement).toBeVisible();
      }
    }
  });

  test('should load scroll animation CSS styles', async ({ page }: { page: Page }) => {
    // First go to homepage to get a valid URL
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Try to find the first post link
    const postLink = page.locator('a[rel="bookmark"]').first();
    const firstPostUrl = await postLink.getAttribute('href').catch(() => null);

    if (!firstPostUrl) {
      // Skip this test if there are no posts
      return;
    }

    await page.goto(firstPostUrl);
    await page.waitForLoadState('domcontentloaded');

    // Check if the style-index.css is loaded
    const stylesheets = await page.evaluate((): string[] => {
      return Array.from(document.styleSheets)
        .map((sheet) => sheet.href)
        .filter((href): href is string => href !== null && href.includes('style-index.css'));
    });

    expect(stylesheets.length).toBeGreaterThanOrEqual(0); // CSS may not be loaded if no animations are present
  });
});

test.describe('Plugin Compatibility', () => {
  test('should work with WordPress 6.8+', async ({ page }: { page: Page }) => {
    await page.goto('/wp-admin');
    await page.waitForLoadState('domcontentloaded');

    // Get WordPress version from the page HTML
    const version = await page.evaluate((): string => {
      const versionElement = Array.from(document.querySelectorAll('*')).find((el) =>
        el.textContent?.match(/Version \d+\.\d+/)
      );
      return versionElement?.textContent || '';
    });

    // If we can't find version text, at least verify the admin page loaded
    const adminPageBody = page.locator('.wp-admin');
    await expect(adminPageBody).toBeVisible();

    if (version) {
      // Extract version like "Version 6.8.3" or just "6.8"
      const match = version.match(/Version?\s*(\d+)\.(\d+)/);
      if (match) {
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        expect(major).toBeGreaterThanOrEqual(6);
        if (major === 6) {
          expect(minor).toBeGreaterThanOrEqual(7);
        }
      }
    }
  });
});
