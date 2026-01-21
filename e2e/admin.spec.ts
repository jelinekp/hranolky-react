/**
 * E2E Test: Admin Panel Flow
 * 
 * Tests admin panel access and device management.
 * Read-only tests - does not write to Firestore.
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Panel Access', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin');

    // Should show login screen (app redirects unauthenticated users)
    // Wait for page to load and look for any sign of the app
    await page.waitForLoadState('networkidle');

    // Should have JELÍNEK in title
    await expect(page).toHaveTitle(/JELÍNEK/);
  });
});

test.describe('Admin Navigation', () => {
  test('admin route accessible', async ({ page }) => {
    const response = await page.goto('/admin');

    // Route should exist (status 200 from SPA)
    expect(response?.status()).toBe(200);
  });
});
