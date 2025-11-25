import { test, expect, type Page } from '@playwright/test';

test.describe('Scroll Block Plugin Basic Check', () => {
  test('should show Scroll Animation panel for paragraph block', async ({
    page,
  }: {
    page: Page;
  }) => {
    // 1. Go directly to the new post editor (as per updated blueprint)
    await page.goto('/wp-admin/post-new.php');
    await page.waitForLoadState('domcontentloaded');

    // 2. Handle any welcome/onboarding dialogs
    const closeButton = page.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeButton.click();
    }

    // 3. Add a Paragraph block (compatible with plugin)
    // We look for the main editor canvas frame
    const editorFrame = page.frameLocator('iframe[name="editor-canvas"]');
    
    // In a fresh editor, there's often an empty paragraph block ready, or we click "Add block"
    // We try to type into the default empty block first
    const defaultBlock = editorFrame.getByRole('document', { name: /Empty block/ });
    
    if (await defaultBlock.isVisible({ timeout: 5000 }).catch(() => false)) {
      await defaultBlock.click();
      await defaultBlock.fill('Testing Scroll Block Plugin');
    } else {
       // Fallback: explicitly add a paragraph
       const addBlockBtn = editorFrame.getByRole('button', { name: 'Add default block' });
       if (await addBlockBtn.isVisible()) {
           await addBlockBtn.click();
           await defaultBlock.fill('Testing Scroll Block Plugin');
       }
    }

    // 4. Verify the "Scroll Animation" panel appears in the inspector sidebar
    // This confirms the plugin is active and the JS logic for `SUPPORTED_BLOCKS` is working
    const scrollAnimationHeading = page.getByRole('heading', { name: 'Scroll Animation' });
    await expect(scrollAnimationHeading).toBeVisible({ timeout: 10000 });

    // 5. Verify the dropdown is interactive
    const animationTypeSelect = page.getByLabel('Animation Type');
    await expect(animationTypeSelect).toBeVisible();
    await expect(animationTypeSelect).toBeEnabled();
  });
});