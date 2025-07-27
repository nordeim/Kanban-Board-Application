import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login with email and password', async ({ page }) => {
    await page.goto('/login')
    
    // Fill login form
    await page.fill('input[name="email"]', 'demo@sponsorflow.io')
    await page.fill('input[name="password"]', 'demo123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should redirect to board
    await expect(page).toHaveURL('/board')
    
    // Should show user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'demo@sponsorflow.io')
    await page.fill('input[name="password"]', 'demo123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/board')
    
    // Open user menu and logout
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Log out')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
})
