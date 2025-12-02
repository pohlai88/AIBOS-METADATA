import { test, expect } from '@playwright/test';

/**
 * Proposals & Approvals E2E Tests
 * 
 * Tests the approval dashboard functionality:
 * - Viewing pending approvals
 * - Filtering by role and impact
 * - Approval/rejection workflow
 * - Statistics sidebar
 */

test.describe('Proposals & Approvals Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/metadata/proposals');
    await page.waitForSelector('text=Change Requests & Approvals');
  });

  test('should display pending approvals count', async ({ page }) => {
    // Should show count in header badge
    await expect(page.locator('text=5 pending')).toBeVisible();
  });

  test('should display all pending approvals', async ({ page }) => {
    // Should show approval cards
    await expect(page.locator('text=customer_name')).toBeVisible();
    await expect(page.locator('text=revenue_gross')).toBeVisible();
    await expect(page.locator('text=tax_code')).toBeVisible();
    await expect(page.locator('text=employee_id')).toBeVisible();
    await expect(page.locator('text=invoice_amount')).toBeVisible();
  });

  test('should display approval card details', async ({ page }) => {
    // Check first approval card (customer_name)
    const card = page.locator('text=customer_name').first();
    
    // Should show field name and tier
    await expect(card).toBeVisible();
    await expect(page.locator('text=Tier 3')).toBeVisible();
    
    // Should show change type
    await expect(page.locator('text=Change Type: sensitivity')).toBeVisible();
    
    // Should show impact badge
    await expect(page.locator('text=HIGH Impact')).toBeVisible();
  });

  test('should display diff view (current vs proposed)', async ({ page }) => {
    // Should show current value
    await expect(page.locator('text=Current')).toBeVisible();
    await expect(page.locator('text=Internal')).toBeVisible();
    
    // Should show proposed value
    await expect(page.locator('text=Proposed')).toBeVisible();
    await expect(page.locator('text=PII (GDPR Article 6)')).toBeVisible();
    
    // Should show arrow indicating change
    // (Arrow icon should be visible between current and proposed)
  });

  test('should display justification', async ({ page }) => {
    // Should show justification section
    await expect(page.locator('text=Justification')).toBeVisible();
    await expect(page.locator('text=This field contains customer names which are Personally Identifiable Information')).toBeVisible();
  });

  test('should display approval chain with statuses', async ({ page }) => {
    // Should show approval chain
    await expect(page.locator('text=Approval Chain')).toBeVisible();
    
    // Should show approvers with statuses
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=data-steward')).toBeVisible();
    
    // Should show approved status (checkmark icon)
    await expect(page.locator('text=1 hour ago')).toBeVisible();
  });

  test('should show Approve/Reject buttons for pending approver', async ({ page }) => {
    // For tax_code (current user is data-steward with pending status)
    await page.getByPlaceholder('Search fields, definitions...').fill('tax_code');
    await page.waitForTimeout(300);
    
    // Should show Approve and Reject buttons
    await expect(page.getByRole('button', { name: /Approve/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Reject/ })).toBeVisible();
  });

  test('should show pending message when not current approver', async ({ page }) => {
    // For customer_name (already approved by data-steward, waiting for domain-lead)
    const customerCard = page.locator('text=customer_name').first();
    await customerCard.scrollIntoViewIfNeeded();
    
    // Should show pending message
    await expect(page.locator('text=Pending approval from')).toBeVisible();
  });

  test('should filter by role', async ({ page }) => {
    // Open role filter
    await page.getByRole('button', { name: /All Roles/ }).click();
    
    // Select Data Steward
    await page.getByRole('option', { name: /Data Steward/ }).click();
    
    // Should filter results
    await page.waitForTimeout(300);
    
    // Should show only approvals pending for data-steward
    // (In sample data: tax_code and invoice_amount)
  });

  test('should filter by impact level', async ({ page }) => {
    // Open impact filter
    await page.getByRole('button', { name: /All Impact Levels/ }).click();
    
    // Select High Impact
    await page.getByRole('option', { name: /High Impact/ }).click();
    
    // Should filter results
    await page.waitForTimeout(300);
    
    // Should show only high-impact approvals
    await expect(page.locator('text=customer_name')).toBeVisible();
    await expect(page.locator('text=employee_id')).toBeVisible();
  });

  test('should clear filters', async ({ page }) => {
    // Apply filters
    await page.getByRole('button', { name: /All Roles/ }).click();
    await page.getByRole('option', { name: /Data Steward/ }).click();
    
    // Clear filters button should appear in sidebar
    await expect(page.getByRole('button', { name: /Clear Filters/ })).toBeVisible();
    
    // Click clear
    await page.getByRole('button', { name: /Clear Filters/ }).click();
    
    // Should show all approvals again
    await expect(page.locator('text=5 pending')).toBeVisible();
  });

  test('should display statistics sidebar', async ({ page }) => {
    // Should show "Requires My Action" count
    await expect(page.locator('text=Requires My Action')).toBeVisible();
    await expect(page.locator('text=3').first()).toBeVisible(); // 3 requiring action as data-steward
    
    // Should show Total Pending
    await expect(page.locator('text=Total Pending')).toBeVisible();
    await expect(page.locator('text=5').nth(1)).toBeVisible();
  });

  test('should display by-impact breakdown in sidebar', async ({ page }) => {
    // Should show impact breakdown
    await expect(page.locator('text=By Impact')).toBeVisible();
    
    // Should show High count (2)
    const highBadge = page.locator('text=High').locator('..').locator('text=2');
    await expect(highBadge).toBeVisible();
    
    // Should show Medium count (1)
    const mediumBadge = page.locator('text=Medium').locator('..').locator('text=1');
    await expect(mediumBadge).toBeVisible();
    
    // Should show Low count (2)
    const lowBadge = page.locator('text=Low').locator('..').locator('text=2');
    await expect(lowBadge).toBeVisible();
  });

  test('should approve a request', async ({ page }) => {
    // Find approval where current user can approve (tax_code)
    await page.getByPlaceholder('Search fields, definitions...').fill('tax_code');
    await page.waitForTimeout(300);
    
    // Setup dialog handler to accept the alert
    page.on('dialog', dialog => dialog.accept());
    
    // Click Approve
    await page.getByRole('button', { name: /Approve/ }).first().click();
    
    // Alert should be shown (in real app, this would update the backend)
  });

  test('should reject a request', async ({ page }) => {
    // Find approval where current user can approve
    await page.getByPlaceholder('Search fields, definitions...').fill('invoice_amount');
    await page.waitForTimeout(300);
    
    // Setup dialog handler
    page.on('dialog', dialog => dialog.accept());
    
    // Click Reject
    await page.getByRole('button', { name: /Reject/ }).first().click();
    
    // Alert should be shown
  });

  test('should view approval details', async ({ page }) => {
    // Find Details button
    const detailsButton = page.getByRole('button', { name: /Details/ }).first();
    await expect(detailsButton).toBeVisible();
    
    // Click Details (in real app, this would navigate or open modal)
    await detailsButton.click();
  });

  test('should export report', async ({ page }) => {
    // Export button should be visible in header
    await expect(page.getByRole('button', { name: /Export Report/ })).toBeVisible();
    
    // Click export (in real app, this would download CSV/PDF)
    await page.getByRole('button', { name: /Export Report/ }).click();
  });

  test('should display empty state when all filters result in no matches', async ({ page }) => {
    // Apply filter that results in no matches
    await page.getByRole('button', { name: /All Impact Levels/ }).click();
    await page.getByRole('option', { name: /High Impact/ }).click();
    
    await page.getByRole('button', { name: /All Roles/ }).click();
    await page.getByRole('option', { name: /Compliance/ }).click();
    
    await page.waitForTimeout(300);
    
    // Should show empty message
    await expect(page.locator('text=No approvals match your filters')).toBeVisible();
  });

  test('should show metadata for each approval', async ({ page }) => {
    // Should show requester
    await expect(page.locator('text=@compliance.officer')).toBeVisible();
    
    // Should show timestamp
    await expect(page.locator('text=2 hours ago')).toBeVisible();
    
    // Should show impact and tier badges
    await expect(page.locator('text=Tier 3')).toBeVisible();
    await expect(page.locator('text=impact')).toBeVisible();
  });
});

