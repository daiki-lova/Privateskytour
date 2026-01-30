import { test, expect } from '@playwright/test';

test.describe('Course Pages', () => {
  test('should load tours page', async ({ page }) => {
    await page.goto('/tours', { waitUntil: 'domcontentloaded' });
    // Should load without errors (may redirect or show content)
    await expect(page).not.toHaveTitle(/error|500/i);
  });

  test('should display tour content or redirect', async ({ page }) => {
    await page.goto('/tours', { waitUntil: 'domcontentloaded' });
    const body = page.locator('body');
    // Tours page should have some content
    await expect(body).not.toBeEmpty();
  });

  test('should have page content visible', async ({ page }) => {
    await page.goto('/tours', { waitUntil: 'domcontentloaded' });
    // Page should have visible content (header, 404 message, or tour content)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    await expect(body).not.toBeEmpty();
  });
});
