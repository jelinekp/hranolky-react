/**
 * Authentication Helper for E2E Tests
 * 
 * Mocks Google OAuth by injecting auth state into localStorage.
 */

import { Page } from '@playwright/test';
import { mockAdminUser, mockRegularUser } from './mockData';

/**
 * Mock authentication by setting localStorage auth state
 */
export async function mockGoogleAuth(page: Page, isAdmin = true) {
  const user = isAdmin ? mockAdminUser : mockRegularUser;

  // Set up mock auth state in localStorage before navigation
  await page.addInitScript((userData) => {
    // Mock Firebase auth state
    localStorage.setItem('mockAuthUser', JSON.stringify(userData));
    localStorage.setItem('mockAuthEnabled', 'true');
  }, user);
}

/**
 * Clear mock authentication
 */
export async function clearMockAuth(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('mockAuthUser');
    localStorage.removeItem('mockAuthEnabled');
  });
}

/**
 * Wait for app to be ready after auth
 */
export async function waitForAppReady(page: Page) {
  // Wait for the loading overlay to disappear
  await page.waitForSelector('[data-testid="loading-overlay"]', { state: 'hidden', timeout: 10000 }).catch(() => { });
  // Wait for main content to appear
  await page.waitForSelector('table, [data-testid="slots-table"]', { timeout: 15000 }).catch(() => { });
}
