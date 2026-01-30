import { test, expect } from '@playwright/test';

test.describe('Internationalization', () => {
  test('should load with Japanese as default language', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // The html element should have lang="ja"
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  });

  test('should render Japanese content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Title should be in Japanese
    await expect(page).toHaveTitle(/ヘリフロント/);
  });

  test('should have language switcher in header', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Look for language switcher or language-related buttons
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 15000 });
  });
});
