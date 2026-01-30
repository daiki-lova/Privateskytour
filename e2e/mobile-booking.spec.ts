import { test, expect, devices } from '@playwright/test';

test.use(devices['Pixel 5']);

test.describe('Mobile View', () => {
  test('should load landing page on mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/ヘリフロント/);
  });

  test('should load booking page on mobile', async ({ page }) => {
    await page.goto('/booking', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveTitle(/error|500|404/i);
  });

  test('should load contact page on mobile', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveTitle(/error|500|404/i);
  });
});
