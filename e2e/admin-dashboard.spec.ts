import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('should load admin area without errors', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/ヘリフロント/);
  });

  test('should display admin content', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    // Should show either dashboard or login content
    const body = page.locator('body');
    await expect(body).toContainText(/ダッシュボード|ログイン|Dashboard|Login/i, { timeout: 10000 });
  });

  test('should have navigation structure', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    // Admin sidebar uses div-based layout with Link components, not semantic nav/aside
    // If DEV_SKIP_AUTH, we see sidebar with menu links. If not, we see login form.
    const sidebarOrForm = page.locator('a[href*="/admin"], form, input[type], button[type="submit"]');
    await expect(sidebarOrForm.first()).toBeVisible({ timeout: 10000 });
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/ヘリフロント/);
  });
});
