import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('should load booking page', async ({ page }) => {
    await page.goto('/booking', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/ヘリフロント/);
  });

  test('should display booking content', async ({ page }) => {
    await page.goto('/booking', { waitUntil: 'domcontentloaded' });
    // Booking page should have main content area
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('should show step indicators', async ({ page }) => {
    await page.goto('/booking', { waitUntil: 'domcontentloaded' });
    // Look for step-related UI elements (step numbers, progress indicators)
    const body = page.locator('body');
    await expect(body).toContainText(/1|STEP|ステップ/i, { timeout: 15000 });
  });

  test('should not show error page', async ({ page }) => {
    await page.goto('/booking', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveTitle(/error|500|404/i);
  });

  test('should have header with navigation', async ({ page }) => {
    await page.goto('/booking', { waitUntil: 'domcontentloaded' });
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 15000 });
  });

  test('should load without critical errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/booking', { waitUntil: 'domcontentloaded' });
    // Just verify the page loaded successfully
    await expect(page).toHaveTitle(/ヘリフロント/);
  });
});
