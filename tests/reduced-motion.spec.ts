import { test, expect, type Page } from '@playwright/test';

test.describe('Reduced Motion Support', () => {
  test('should disable animations when prefers-reduced-motion is set', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Set the prefers-reduced-motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Create a post with scroll animation
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('domcontentloaded');

    // Close welcome dialog if present
    const closeButton = page.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
    }

    // Create post with animation
    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
    const titleBox = editorFrame.getByRole('textbox', { name: 'Add title' });
    await titleBox.fill('Reduced Motion Test', { timeout: 15000 });

    const addBlockButton = editorFrame.getByRole('button', { name: 'Add default block' });
    await addBlockButton.click({ timeout: 15000 });

    const blockEditor = editorFrame.getByRole('document', { name: /Empty block/ });
    await blockEditor.fill('This paragraph should not animate with reduced motion', {
      timeout: 15000,
    });

    const animationTypeSelect = page.getByLabel('Animation Type');
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

    // Visit the frontend post with reduced motion preference
    await page.goto(postUrl);
    await page.waitForLoadState('domcontentloaded');

    // Verify the paragraph has the animation class but animations should be disabled via CSS
    const animatedParagraph = page.locator('p.scroll-anim-fade-in[data-scroll-anim="1"]');
    await expect(animatedParagraph).toBeVisible();

    // Check computed styles - with prefers-reduced-motion, the element should have:
    // - opacity: 1 (not 0)
    // - transform: none
    // - animation: none
    const computedStyles = await animatedParagraph.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        opacity: styles.opacity,
        transform: styles.transform,
        animation: styles.animation,
      };
    });

    // With reduced motion, the CSS should override the animation styles
    expect(parseFloat(computedStyles.opacity)).toBe(1);
    expect(computedStyles.transform).toBe('none');
    expect(computedStyles.animation).toContain('none');
  });

  test('should disable parallax effect when prefers-reduced-motion is set', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Set the prefers-reduced-motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Create a post with parallax
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('domcontentloaded');

    // Close welcome dialog if present
    const closeButton = page.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
    }

    // Create post
    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
    const titleBox = editorFrame.getByRole('textbox', { name: 'Add title' });
    await titleBox.fill('Parallax Reduced Motion Test', { timeout: 15000 });

    const addBlockButton = editorFrame.getByRole('button', { name: 'Add default block' });
    await addBlockButton.click({ timeout: 15000 });

    const blockEditor = editorFrame.getByRole('document', { name: /Empty block/ });
    await blockEditor.fill('This paragraph has parallax disabled with reduced motion', {
      timeout: 15000,
    });

    // Enable parallax
    const parallaxToggle = page.getByLabel('Enable Parallax Effect');
    await parallaxToggle.click();

    // Publish the post
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    const publishPanelButton = page
      .getByLabel('Editor publish')
      .getByRole('button', { name: 'Publish', exact: true });
    await publishPanelButton.click();

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

    // Verify the paragraph has parallax data attribute but effect is disabled
    const parallaxParagraph = page.locator('p[data-parallax="1"]');
    await expect(parallaxParagraph).toBeVisible();

    // Check that animations are disabled
    const computedStyles = await parallaxParagraph.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        animation: styles.animation,
        transform: styles.transform,
      };
    });

    expect(computedStyles.animation).toContain('none');
    expect(computedStyles.transform).toBe('none');
  });

  test('should disable clip-path animations when prefers-reduced-motion is set', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Set the prefers-reduced-motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Create a post with circle reveal animation
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('domcontentloaded');

    // Close welcome dialog if present
    const closeButton = page.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
    }

    // Create post
    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
    const titleBox = editorFrame.getByRole('textbox', { name: 'Add title' });
    await titleBox.fill('Circle Reveal Reduced Motion Test', { timeout: 15000 });

    const addBlockButton = editorFrame.getByRole('button', { name: 'Add default block' });
    await addBlockButton.click({ timeout: 15000 });

    const blockEditor = editorFrame.getByRole('document', { name: /Empty block/ });
    await blockEditor.fill('Circle reveal should be disabled with reduced motion', {
      timeout: 15000,
    });

    const animationTypeSelect = page.getByLabel('Animation Type');
    await animationTypeSelect.selectOption('Circle Reveal');

    // Publish the post
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    const publishPanelButton = page
      .getByLabel('Editor publish')
      .getByRole('button', { name: 'Publish', exact: true });
    await publishPanelButton.click();

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

    // Verify clip-path is disabled
    const revealParagraph = page.locator('p.scroll-anim-circle-reveal[data-scroll-anim="1"]');
    await expect(revealParagraph).toBeVisible();

    const computedStyles = await revealParagraph.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        clipPath: styles.clipPath,
        animation: styles.animation,
      };
    });

    expect(computedStyles.clipPath).toBe('none');
    expect(computedStyles.animation).toContain('none');
  });

  test('should disable blur filter when prefers-reduced-motion is set', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Set the prefers-reduced-motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Create a post with blur-in animation
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('domcontentloaded');

    // Close welcome dialog if present
    const closeButton = page.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
    }

    // Create post
    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
    const titleBox = editorFrame.getByRole('textbox', { name: 'Add title' });
    await titleBox.fill('Blur In Reduced Motion Test', { timeout: 15000 });

    const addBlockButton = editorFrame.getByRole('button', { name: 'Add default block' });
    await addBlockButton.click({ timeout: 15000 });

    const blockEditor = editorFrame.getByRole('document', { name: /Empty block/ });
    await blockEditor.fill('Blur effect should be disabled with reduced motion', {
      timeout: 15000,
    });

    const animationTypeSelect = page.getByLabel('Animation Type');
    await animationTypeSelect.selectOption('Blur In');

    // Publish the post
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    const publishPanelButton = page
      .getByLabel('Editor publish')
      .getByRole('button', { name: 'Publish', exact: true });
    await publishPanelButton.click();

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

    // Verify filter is disabled
    const blurParagraph = page.locator('p.scroll-anim-blur-in[data-scroll-anim="1"]');
    await expect(blurParagraph).toBeVisible();

    const computedStyles = await blurParagraph.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        filter: styles.filter,
        opacity: styles.opacity,
        animation: styles.animation,
      };
    });

    expect(computedStyles.filter).toBe('none');
    expect(parseFloat(computedStyles.opacity)).toBe(1);
    expect(computedStyles.animation).toContain('none');
  });

  test('should allow animations when prefers-reduced-motion is not set', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Do NOT set reduced motion preference (default is 'no-preference')
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    // Create a post with animation
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('domcontentloaded');

    // Close welcome dialog if present
    const closeButton = page.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
    }

    // Create post
    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
    const titleBox = editorFrame.getByRole('textbox', { name: 'Add title' });
    await titleBox.fill('Normal Animation Test', { timeout: 15000 });

    const addBlockButton = editorFrame.getByRole('button', { name: 'Add default block' });
    await addBlockButton.click({ timeout: 15000 });

    const blockEditor = editorFrame.getByRole('document', { name: /Empty block/ });
    await blockEditor.fill('This paragraph should animate normally', { timeout: 15000 });

    const animationTypeSelect = page.getByLabel('Animation Type');
    await animationTypeSelect.selectOption('Fade In');

    // Publish the post
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    const publishPanelButton = page
      .getByLabel('Editor publish')
      .getByRole('button', { name: 'Publish', exact: true });
    await publishPanelButton.click();

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

    // Verify the paragraph has the animation classes
    const animatedParagraph = page.locator('p.scroll-anim-fade-in[data-scroll-anim="1"]');
    await expect(animatedParagraph).toBeVisible();

    // Animation name should be defined (not 'none')
    const animationName = await animatedParagraph.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.animationName;
    });

    // Should have the scrollFadeIn animation name
    expect(animationName).not.toBe('none');
    expect(animationName).toContain('scrollFadeIn');
  });
});
