import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/ヘリフロント/);
  });

  test('should have visible content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // The page should have a body with content (not blank)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    // Should have some visible text content
    await expect(body).not.toBeEmpty();
  });

  test('should have navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Header should contain navigation
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 15000 });
  });

  test('should have main sections', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // The page should have identifiable sections
    const sections = page.locator('section, [id="plans"], [id="flow"], [id="faq"], [id="access"]');
    await expect(sections.first()).toBeVisible({ timeout: 15000 });
  });
});
