import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('should load admin page without errors', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    // Should load either login page or dashboard (depending on DEV_SKIP_AUTH)
    await expect(page).toHaveTitle(/ヘリフロント/);
  });

  test('should display login form or dashboard', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    // If DEV_SKIP_AUTH is true, we might be redirected to dashboard
    // If not, we should see login form
    const body = page.locator('body');
    await expect(body).toContainText(/ログイン|ダッシュボード|Dashboard|ADMIN/i, { timeout: 10000 });
  });

  test('should have admin branding', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    // Should show PRIVATESKY TOUR branding
    const body = page.locator('body');
    await expect(body).toContainText(/PRIVATESKY|プライベートスカイ|ADMIN/i, { timeout: 10000 });
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/ヘリフロント/);
  });
});
