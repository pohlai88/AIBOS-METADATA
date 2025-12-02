import { test, expect } from '@playwright/test';

/**
 * Change Request Workflow E2E Tests
 * 
 * Tests the complete change request workflow:
 * - Request Change button appears when field selected
 * - MicroActionDrawer slides in
 * - Change request form validation
 * - Tier-aware approval flow
 * - Impact Analysis drawer
 */

test.describe('Change Request Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/metadata/glossary');
    await page.waitForSelector('text=Metadata Glossary');
  });

  test('should show Request Change button when field is selected', async ({ page }) => {
    // No field selected - button should not be visible
    await expect(page.getByRole('button', { name: /Request Change/ })).not.toBeVisible();
    
    // Select a field
    await page.getByText('customer_name', { exact: false }).first().click();
    
    // Request Change button should appear
    await expect(page.getByRole('button', { name: /Request Change/ })).toBeVisible();
  });

  test('should open MicroActionDrawer when Request Change is clicked', async ({ page }) => {
    // Select field
    await page.getByText('customer_name', { exact: false }).first().click();
    
    // Click Request Change
    await page.getByRole('button', { name: /Request Change/ }).click();
    
    // Drawer should slide in
    await expect(page.locator('text=Request Metadata Change')).toBeVisible();
    
    // Should show field info
    await expect(page.locator('text=customer_name').nth(1)).toBeVisible();
    await expect(page.locator('text=Tier 2')).toBeVisible();
  });

  test('should display change type options', async ({ page }) => {
    // Select field and open drawer
    await page.getByText('customer_name', { exact: false }).first().click();
    await page.getByRole('button', { name: /Request Change/ }).click();
    
    // Open change type dropdown
    await page.getByRole('button', { name: /Business Definition/ }).click();
    
    // Should show all options
    await expect(page.getByRole('option', { name: /Business Definition/ })).toBeVisible();
    await expect(page.getByRole('option', { name: /Governance Tier/ })).toBeVisible();
    await expect(page.getByRole('option', { name: /Data Steward/ })).toBeVisible();
    await expect(page.getByRole('option', { name: /Sensitivity Level/ })).toBeVisible();
    await expect(page.getByRole('option', { name: /Tags\/Labels/ })).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Select field and open drawer
    await page.getByText('customer_name', { exact: false }).first().click();
    await page.getByRole('button', { name: /Request Change/ }).click();
    
    // Submit button should be disabled initially (no values entered)
    const submitButton = page.getByRole('button', { name: /Submit/ });
    await expect(submitButton).toBeDisabled();
  });

  test('should show tier-aware approval flow (T2 field)', async ({ page }) => {
    // Select customer_name (Tier 2)
    await page.getByText('customer_name', { exact: false }).first().click();
    await page.getByRole('button', { name: /Request Change/ }).click();
    
    // Fill form with low impact
    await page.getByLabel('Proposed Value').fill('Updated customer name field');
    await page.getByLabel('Justification').fill('Clarifying the definition for better understanding');
    
    // Should show approval flow for T2 + Low impact
    await expect(page.locator('text=Requires 1 approval (Data Steward)')).toBeVisible();
  });

  test('should show tier-aware approval flow (T3 field with high impact)', async ({ page }) => {
    // Select revenue_gross (Tier 3)
    await page.getByText('revenue_gross', { exact: false }).first().click();
    await page.getByRole('button', { name: /Request Change/ }).click();
    
    // Fill form with high impact
    await page.getByLabel('Proposed Value').fill('New revenue definition');
    await page.getByLabel('Justification').fill('MFRS 15 alignment required');
    
    // Change impact to High
    await page.getByRole('button', { name: /Low - Cosmetic/ }).click();
    await page.getByRole('option', { name: /High - Critical/ }).click();
    
    // Should show approval flow for T3 + High impact
    await expect(page.locator('text=Requires 2 approvals (Steward + Domain Lead)')).toBeVisible();
  });

  test('should submit change request and show impact analysis', async ({ page }) => {
    // Select customer_name
    await page.getByText('customer_name', { exact: false }).first().click();
    await page.getByRole('button', { name: /Request Change/ }).click();
    
    // Fill form
    await page.getByLabel('Proposed Value').fill('PII (GDPR Article 6)');
    await page.getByLabel('Justification').fill('Upgrading to PII classification for GDPR compliance');
    
    // Change type to Sensitivity
    await page.getByRole('button', { name: /Business Definition/ }).click();
    await page.getByRole('option', { name: /Sensitivity Level/ }).click();
    
    // Submit
    const submitButton = page.getByRole('button', { name: /Submit/ });
    await submitButton.click();
    
    // Should close change request drawer and open impact analysis drawer
    await expect(page.locator('text=Request Metadata Change')).not.toBeVisible();
    await expect(page.locator('text=Impact Analysis')).toBeVisible();
  });

  test('should display impact analysis with risk assessment', async ({ page }) => {
    // Submit change request to trigger impact analysis
    await page.getByText('customer_name', { exact: false }).first().click();
    await page.getByRole('button', { name: /Request Change/ }).click();
    
    await page.getByLabel('Proposed Value').fill('PII (GDPR Article 6)');
    await page.getByLabel('Justification').fill('GDPR compliance');
    
    // Change to Sensitivity
    await page.getByRole('button', { name: /Business Definition/ }).click();
    await page.getByRole('option', { name: /Sensitivity Level/ }).click();
    
    await page.getByRole('button', { name: /Submit/ }).click();
    
    // Wait for impact analysis drawer
    await page.waitForSelector('text=Impact Analysis');
    
    // Should show overall risk
    await expect(page.locator('text=HIGH RISK')).toBeVisible();
    
    // Should show affected systems count
    await expect(page.locator('text=8 systems affected')).toBeVisible();
    await expect(page.locator('text=47 users impacted')).toBeVisible();
  });

  test('should display impact analysis affected components', async ({ page }) => {
    // Trigger impact analysis
    await page.getByText('customer_name', { exact: false }).first().click();
    await page.getByRole('button', { name: /Request Change/ }).click();
    
    await page.getByLabel('Proposed Value').fill('PII');
    await page.getByLabel('Justification').fill('GDPR');
    await page.getByRole('button', { name: /Business Definition/ }).click();
    await page.getByRole('option', { name: /Sensitivity Level/ }).click();
    await page.getByRole('button', { name: /Submit/ }).click();
    
    // Wait for impact analysis
    await page.waitForSelector('text=Impact Analysis');
    
    // Should show affected components categories
    await expect(page.locator('text=databases')).toBeVisible();
    await expect(page.locator('text=apis')).toBeVisible();
    await expect(page.locator('text=reports')).toBeVisible();
    
    // Should show specific items
    await expect(page.locator('text=CRM Database')).toBeVisible();
    await expect(page.locator('text=GET /api/customers')).toBeVisible();
    await expect(page.locator('text=CRITICAL')).toBeVisible(); // Risk level for API
  });

  test('should display recommendations in impact analysis', async ({ page }) => {
    // Trigger impact analysis
    await page.getByText('customer_name', { exact: false }).first().click();
    await page.getByRole('button', { name: /Request Change/ }).click();
    
    await page.getByLabel('Proposed Value').fill('PII');
    await page.getByLabel('Justification').fill('GDPR');
    await page.getByRole('button', { name: /Business Definition/ }).click();
    await page.getByRole('option', { name: /Sensitivity Level/ }).click();
    await page.getByRole('button', { name: /Submit/ }).click();
    
    await page.waitForSelector('text=Impact Analysis');
    
    // Should show recommendations
    await expect(page.locator('text=Recommendations')).toBeVisible();
    await expect(page.locator('text=Enable encryption for customer_name')).toBeVisible();
    await expect(page.locator('text=Update API authentication')).toBeVisible();
  });

  test('should allow proceeding with change from impact analysis', async ({ page }) => {
    // Trigger impact analysis
    await page.getByText('customer_name', { exact: false }).first().click();
    await page.getByRole('button', { name: /Request Change/ }).click();
    
    await page.getByLabel('Proposed Value').fill('PII');
    await page.getByLabel('Justification').fill('GDPR');
    await page.getByRole('button', { name: /Business Definition/ }).click();
    await page.getByRole('option', { name: /Sensitivity Level/ }).click();
    await page.getByRole('button', { name: /Submit/ }).click();
    
    await page.waitForSelector('text=Impact Analysis');
    
    // Should show Proceed button
    const proceedButton = page.getByRole('button', { name: /Proceed/ });
    await expect(proceedButton).toBeVisible();
    
    // Click proceed (this will show alert in current implementation)
    page.on('dialog', dialog => dialog.accept());
    await proceedButton.click();
  });

  test('should allow canceling change request', async ({ page }) => {
    // Open change request drawer
    await page.getByText('customer_name', { exact: false }).first().click();
    await page.getByRole('button', { name: /Request Change/ }).click();
    
    // Click Cancel
    await page.getByRole('button', { name: /Cancel/ }).click();
    
    // Drawer should close
    await expect(page.locator('text=Request Metadata Change')).not.toBeVisible();
  });

  test('should close drawer with X button', async ({ page }) => {
    // Open change request drawer
    await page.getByText('customer_name', { exact: false }).first().click();
    await page.getByRole('button', { name: /Request Change/ }).click();
    
    // Click X button
    await page.locator('button').filter({ hasText: /×/ }).first().click();
    
    // Drawer should close
    await expect(page.locator('text=Request Metadata Change')).not.toBeVisible();
  });
});

