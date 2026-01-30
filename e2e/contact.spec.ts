import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test('should load contact page', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/ヘリフロント/);
  });

  test('should display contact content', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    const body = page.locator('body');
    // Contact page should have contact-related text
    await expect(body).toContainText(/お問い合わせ|Contact|連絡/i, { timeout: 15000 });
  });

  test('should have form fields', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    // Wait for the form to render (client-side)
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 15000 });
  });

  test('should not show error page', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveTitle(/error|500|404/i);
  });
});
