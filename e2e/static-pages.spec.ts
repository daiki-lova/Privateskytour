import { test, expect } from '@playwright/test';

test.describe('Static Pages', () => {
  test('should display terms page', async ({ page }) => {
    await page.goto('/terms', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/ヘリフロント/);
    // Terms page should have content
    const content = page.locator('body');
    await expect(content).toContainText(/利用規約|Terms/i, { timeout: 10000 });
  });

  test('should display privacy policy page', async ({ page }) => {
    await page.goto('/privacy', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/ヘリフロント/);
    const content = page.locator('body');
    await expect(content).toContainText(/プライバシー|Privacy/i, { timeout: 10000 });
  });

  test('should display company page', async ({ page }) => {
    await page.goto('/company', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/ヘリフロント/);
    const content = page.locator('body');
    await expect(content).toContainText(/会社|Company|運営/i, { timeout: 10000 });
  });
});
