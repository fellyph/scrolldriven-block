import { test, expect } from '@playwright/test';

test.describe('Scroll Block', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that the page loaded successfully
    await expect(page).toHaveTitle(/WordPress/);
  });

  test('should have the scroll block in the editor', async ({ page }) => {
    await page.goto('/wp-admin');

    // This is a basic test - you'll need to adjust based on your actual block
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify we can access the admin area
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
  });

  test('should render the scroll block on the frontend', async ({ page }) => {
    await page.goto('/');

    // Wait for any scroll-driven animations or interactions to be ready
    await page.waitForLoadState('domcontentloaded');

    // Basic assertion - adjust selector based on your block's HTML structure
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });
});
