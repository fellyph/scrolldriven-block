import { test, expect, type Page } from '@playwright/test';

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
  test('should show Scroll Animation panel for paragraph block', async ({ page }: { page: Page }) => {
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('networkidle');

    // Close welcome dialog if present
    const closeButton = page.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }

    // Add a paragraph block
    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
    const addBlockButton = editorFrame.getByRole('button', { name: 'Add default block' });
    await addBlockButton.click();

    // Type some text
    const blockEditor = editorFrame.getByRole('document', { name: /Empty block/ });
    await blockEditor.fill('Test paragraph with scroll animation');

    // Check for Scroll Animation panel in the sidebar
    const scrollAnimationHeading = page.getByRole('heading', { name: 'Scroll Animation' });
    await expect(scrollAnimationHeading).toBeVisible();

    // Verify Animation Type dropdown exists
    const animationTypeSelect = page.getByLabel('Animation Type');
    await expect(animationTypeSelect).toBeVisible();
  });

  test('should apply Fade In animation to paragraph', async ({ page }: { page: Page }) => {
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('networkidle');

    // Close welcome dialog if present
    const closeButton = page.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }

    // Add title
    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
    const titleBox = editorFrame.getByRole('textbox', { name: 'Add title' });
    await titleBox.fill('Test Animation Post');

    // Add paragraph
    const addBlockButton = editorFrame.getByRole('button', { name: 'Add default block' });
    await addBlockButton.click();

    const blockEditor = editorFrame.getByRole('document', { name: /Empty block/ });
    await blockEditor.fill('This paragraph will fade in');

    // Select Fade In animation
    const animationTypeSelect = page.getByLabel('Animation Type');
    await animationTypeSelect.selectOption('Fade In');

    // Verify the animation was applied (look for the indicator button in the frame)
    const animationIndicator = editorFrame.getByRole('button', {
      name: /Scroll Animation Applied/,
    });
    await expect(animationIndicator).toBeVisible();
  });

  test('should have all animation type options available', async ({ page }: { page: Page }) => {
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('networkidle');

    // Close welcome dialog if present
    const closeButton = page.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }

    // Add a paragraph block
    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
    const addBlockButton = editorFrame.getByRole('button', { name: 'Add default block' });
    await addBlockButton.click();

    // Check animation options
    const animationTypeSelect = page.getByLabel('Animation Type');

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
  test('should render published post with scroll animation classes', async ({ page }: { page: Page }) => {
    // First create and publish a post with animation
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('networkidle');

    // Close welcome dialog if present
    const closeButton = page.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }

    // Create post with animation
    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
    const titleBox = editorFrame.getByRole('textbox', { name: 'Add title' });
    await titleBox.fill('Frontend Animation Test');

    const addBlockButton = editorFrame.getByRole('button', { name: 'Add default block' });
    await addBlockButton.click();

    const blockEditor = editorFrame.getByRole('document', { name: /Empty block/ });
    await blockEditor.fill('This paragraph has a fade in animation');

    const animationTypeSelect = page.getByLabel('Animation Type');
    await animationTypeSelect.selectOption('Fade In');

    // Publish the post
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    const publishPanelButton = page
      .getByLabel('Editor publish')
      .getByRole('button', { name: 'Publish', exact: true });
    await publishPanelButton.click();

    // Wait for post to be published
    await page.waitForSelector('text=is now live');

    // Get the post URL
    const viewPostLink = page.getByRole('link', { name: 'View Post' }).first();
    const postUrl = await viewPostLink.getAttribute('href');

    if (!postUrl) {
      throw new Error('Could not get post URL');
    }

    // Visit the frontend post
    await page.goto(postUrl);
    await page.waitForLoadState('networkidle');

    // Verify the paragraph has correct scroll animation classes and attributes
    const animatedParagraph = page.locator(
      'p.scroll-anim-block.scroll-anim-fade-in[data-scroll-anim="1"]'
    );
    await expect(animatedParagraph).toBeVisible();
    await expect(animatedParagraph).toContainText('This paragraph has a fade in animation');
  });

  test('should apply different animation types correctly on frontend', async ({ page }: { page: Page }) => {
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
      await page.waitForLoadState('networkidle');

      const closeButton = page.getByRole('button', { name: 'Close' });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }

      const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
      const titleBox = editorFrame.getByRole('textbox', { name: 'Add title' });
      await titleBox.fill(`Test ${animation.type}`);

      const addBlockButton = editorFrame.getByRole('button', { name: 'Add default block' });
      await addBlockButton.click();

      const blockEditor = editorFrame.getByRole('document', { name: /Empty block/ });
      await blockEditor.fill(`Testing ${animation.type}`);

      const animationTypeSelect = page.getByLabel('Animation Type');
      await animationTypeSelect.selectOption(animation.type);

      // Publish
      await page.getByRole('button', { name: 'Publish', exact: true }).click();
      const publishPanelButton = page
        .getByLabel('Editor publish')
        .getByRole('button', { name: 'Publish', exact: true });
      await publishPanelButton.click();

      await page.waitForSelector('text=is now live');

      // Visit frontend
      const viewPostLink = page.getByRole('link', { name: 'View Post' }).first();
      const postUrl = await viewPostLink.getAttribute('href');

      if (!postUrl) {
        throw new Error('Could not get post URL');
      }

      await page.goto(postUrl);
      await page.waitForLoadState('networkidle');

      // Verify animation class
      const animatedElement = page.locator(
        `p.scroll-anim-block.${animation.class}[data-scroll-anim="1"]`
      );
      await expect(animatedElement).toBeVisible();
    }
  });

  test('should load scroll animation CSS styles', async ({ page }: { page: Page }) => {
    await page.goto('/2025/10/12/test-scroll-animations/');
    await page.waitForLoadState('networkidle');

    // Check if the style-index.css is loaded
    const stylesheets = await page.evaluate((): string[] => {
      return Array.from(document.styleSheets)
        .map((sheet) => sheet.href)
        .filter((href): href is string => href !== null && href.includes('style-index.css'));
    });

    expect(stylesheets.length).toBeGreaterThan(0);
  });
});

test.describe('Plugin Compatibility', () => {
  test('should work with WordPress 6.8+', async ({ page }: { page: Page }) => {
    await page.goto('/wp-admin');
    await page.waitForLoadState('networkidle');

    // Check WordPress version in footer
    const versionText = page.locator('text=/Version \\d+\\.\\d+/');
    await expect(versionText).toBeVisible();

    const version = await versionText.textContent();
    
    if (!version) {
      throw new Error('Could not find WordPress version');
    }

    const match = version.match(/\d+\.\d+/);
    if (!match) {
      throw new Error('Could not parse WordPress version');
    }

    const versionNumber = parseFloat(match[0]);

    expect(versionNumber).toBeGreaterThanOrEqual(6.8);
  });
});

