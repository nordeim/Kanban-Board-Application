import { test, expect } from '@playwright/test'

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="email"]', 'demo@sponsorflow.io')
    await page.fill('input[name="password"]', 'demo123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/board')
  })

  test('should display all 9 stages', async ({ page }) => {
    const stages = [
      'New Leads',
      'Initial Contact',
      'Negotiation',
      'Contract Review',
      'Content Creation',
      'Review & Approval',
      'Publishing',
      'Payment Pending',
      'Completed',
    ]

    for (const stage of stages) {
      await expect(page.locator(`text=${stage}`)).toBeVisible()
    }
  })

  test('should create a new deal', async ({ page }) => {
    // Click add new deal button
    await page.click('button:has-text("New Deal")')
    
    // Fill in deal form
    await page.selectOption('select[name="sponsorId"]', { index: 1 })
    await page.click('button:has-text("Next")')
    
    await page.fill('input[name="title"]', 'E2E Test Deal')
    await page.fill('input[name="dealValue"]', '5000')
    await page.selectOption('select[name="dealType"]', 'DEDICATED_VIDEO')
    
    // Navigate through steps
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Next")')
    }
    
    // Submit
    await page.click('button:has-text("Create Deal")')
    
    // Should see success message
    await expect(page.locator('text=Deal created successfully')).toBeVisible()
    
    // Should see new deal on board
    await expect(page.locator('text=E2E Test Deal')).toBeVisible()
  })

  test('should drag and drop deal between stages', async ({ page }) => {
    // Find a deal card
    const dealCard = page.locator('[data-testid="deal-card"]').first()
    const targetColumn = page.locator('[data-testid="column-NEGOTIATION"]')
    
    // Drag and drop
    await dealCard.dragTo(targetColumn)
    
    // Should see success message
    await expect(page.locator('text=Deal moved successfully')).toBeVisible()
  })

  test('should filter deals by search', async ({ page }) => {
    // Type in search
    await page.fill('input[placeholder="Search deals..."]', 'TechFlow')
    
    // Should only show matching deals
    await expect(page.locator('text=TechFlow')).toBeVisible()
    
    // Other deals should not be visible
    await expect(page.locator('text=GameZone')).not.toBeVisible()
  })

  test('should open deal details on click', async ({ page }) => {
    // Click on a deal card
    await page.click('[data-testid="deal-card"]')
    
    // Should open deal details
    await expect(page.locator('[data-testid="deal-details"]')).toBeVisible()
  })
})
