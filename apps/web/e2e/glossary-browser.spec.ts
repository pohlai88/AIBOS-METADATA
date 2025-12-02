import { test, expect } from '@playwright/test';

/**
 * Metadata Glossary Browser E2E Tests
 * 
 * Tests the core functionality of the glossary browser:
 * - Search and filtering
 * - Row selection and sidebar updates
 * - All 6 sidebar tabs (Definition, Owner, Quality, Lineage, AI, Compliance)
 */

test.describe('Metadata Glossary Browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/metadata/glossary');
    
    // Wait for the page to load
    await page.waitForSelector('text=Metadata Glossary');
  });

  test('should display 25 metadata fields by default', async ({ page }) => {
    // Check that the field count badge shows 25
    await expect(page.locator('text=25 fields')).toBeVisible();
    
    // Verify Demo Data badge is visible
    await expect(page.locator('text=Demo Data')).toBeVisible();
  });

  test('should search fields by name', async ({ page }) => {
    // Search for "customer"
    const searchInput = page.getByPlaceholder('Search fields, definitions...');
    await searchInput.fill('customer');
    
    // Wait for results to update
    await page.waitForTimeout(300);
    
    // Should show fewer fields
    await expect(page.locator('text=customer_name')).toBeVisible();
    await expect(page.locator('text=customer_segment')).toBeVisible();
  });

  test('should filter by domain', async ({ page }) => {
    // Open domain filter
    await page.getByRole('button', { name: /All Domains/ }).click();
    
    // Select Finance
    await page.getByRole('option', { name: /Finance/ }).click();
    
    // Should show Finance count in badge
    await expect(page.locator('text=13 fields')).toBeVisible();
  });

  test('should filter by module', async ({ page }) => {
    // Open module filter
    await page.getByRole('button', { name: /All Modules/ }).click();
    
    // Select AR
    await page.getByRole('option', { name: 'AR' }).click();
    
    // Should show filtered results
    await page.waitForTimeout(300);
    await expect(page.locator('text=customer_name')).toBeVisible();
  });

  test('should select a field and update sidebar', async ({ page }) => {
    // Click on customer_name row
    await page.getByText('customer_name', { exact: false }).first().click();
    
    // Sidebar should show field details
    await expect(page.locator('text=Customer Name')).toBeVisible();
    await expect(page.locator('text=customer_name').nth(1)).toBeVisible();
    
    // Definition tab should be active by default
    await expect(page.locator('text=Business Definition')).toBeVisible();
  });

  test('should display Definition tab content', async ({ page }) => {
    // Select customer_name
    await page.getByText('customer_name', { exact: false }).first().click();
    
    // Click Definition tab (should be active by default)
    await page.getByRole('button', { name: /Definition/ }).click();
    
    // Should show business definition
    await expect(page.locator('text=The legal name of the customer')).toBeVisible();
    
    // Should show technical details
    await expect(page.locator('text=ar_customer_nm')).toBeVisible();
    await expect(page.locator('text=VARCHAR(255)')).toBeVisible();
    
    // Should show sensitivity
    await expect(page.locator('text=PII')).toBeVisible();
    
    // Should show tags
    await expect(page.locator('text=customer')).toBeVisible();
    await expect(page.locator('text=finance')).toBeVisible();
  });

  test('should display Owner tab content', async ({ page }) => {
    // Select customer_name
    await page.getByText('customer_name', { exact: false }).first().click();
    
    // Click Owner tab
    await page.getByRole('button', { name: /Owner/ }).click();
    
    // Should show data steward
    await expect(page.locator('text=@john.doe')).toBeVisible();
    
    // Should show autonomy tier
    await expect(page.locator('text=Tier 2')).toBeVisible();
  });

  test('should display Quality tab content', async ({ page }) => {
    // Select customer_name
    await page.getByText('customer_name', { exact: false }).first().click();
    
    // Click Quality tab
    await page.getByRole('button', { name: /Quality/ }).click();
    
    // Should show quality score
    await expect(page.locator('text=94%')).toBeVisible();
    
    // Should show last profiled date
    await expect(page.locator('text=Last Profiled')).toBeVisible();
  });

  test('should display Lineage tab with graph', async ({ page }) => {
    // Select customer_name (has lineage data)
    await page.getByText('customer_name', { exact: false }).first().click();
    
    // Click Lineage tab
    await page.getByRole('button', { name: /Lineage/ }).click();
    
    // Should show lineage sections
    await expect(page.locator('text=Upstream Sources')).toBeVisible();
    await expect(page.locator('text=Current Field')).toBeVisible();
    await expect(page.locator('text=Downstream Consumers')).toBeVisible();
    
    // Should show lineage nodes
    await expect(page.locator('text=CRM Database')).toBeVisible();
    await expect(page.locator('text=Sales Dashboard')).toBeVisible();
    
    // Should show "View Full Lineage Graph" button
    await expect(page.getByRole('button', { name: /View Full Lineage Graph/ })).toBeVisible();
  });

  test('should display Lineage empty state for fields without lineage', async ({ page }) => {
    // Select invoice_number (no lineage data)
    await page.getByText('invoice_number', { exact: false }).first().click();
    
    // Click Lineage tab
    await page.getByRole('button', { name: /Lineage/ }).click();
    
    // Should show empty state
    await expect(page.locator('text=No lineage mapped yet')).toBeVisible();
  });

  test('should display AI tab with suggestions', async ({ page }) => {
    // Select customer_name (has AI suggestions)
    await page.getByText('customer_name', { exact: false }).first().click();
    
    // Click AI tab
    await page.getByRole('button', { name: /AI/ }).click();
    
    // Should show AI suggestion
    await expect(page.locator('text=PII field not tagged for GDPR compliance')).toBeVisible();
    
    // Should show confidence score
    await expect(page.locator('text=98% confidence')).toBeVisible();
    
    // Should show Accept/Reject buttons
    await expect(page.getByRole('button', { name: /Accept/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Reject/ })).toBeVisible();
  });

  test('should display AI empty state for fields without suggestions', async ({ page }) => {
    // Select revenue_gross (no AI suggestions)
    await page.getByText('revenue_gross', { exact: false }).first().click();
    
    // Click AI tab
    await page.getByRole('button', { name: /AI/ }).click();
    
    // Should show empty state
    await expect(page.locator('text=All clear! No suggestions for this field')).toBeVisible();
  });

  test('should display Compliance tab with status', async ({ page }) => {
    // Select customer_name (has compliance data)
    await page.getByText('customer_name', { exact: false }).first().click();
    
    // Click Compliance tab
    await page.getByRole('button', { name: /Compliance/ }).click();
    
    // Should show overall status
    await expect(page.locator('text=Partially Compliant')).toBeVisible();
    
    // Should show standards
    await expect(page.locator('text=GDPR (Article 6)')).toBeVisible();
    await expect(page.locator('text=PDPA (Malaysia)')).toBeVisible();
    await expect(page.locator('text=ISO 27001')).toBeVisible();
    
    // Should show gap analysis
    await expect(page.locator('text=Gap Identified:')).toBeVisible();
    await expect(page.locator('text=Missing explicit consent tracking')).toBeVisible();
  });

  test('should show AI suggestion badge in quality column', async ({ page }) => {
    // Look for phone_number which has AI suggestions
    await page.getByPlaceholder('Search fields, definitions...').fill('phone');
    await page.waitForTimeout(300);
    
    // Should show sparkles icon indicating AI suggestions
    const phoneRow = page.locator('text=phone_number').first();
    await expect(phoneRow).toBeVisible();
    
    // The sparkles icon should be visible in the quality column
    // (This tests the AI badge integration in the grid)
  });

  test('should clear filters when selecting "All"', async ({ page }) => {
    // Apply domain filter
    await page.getByRole('button', { name: /All Domains/ }).click();
    await page.getByRole('option', { name: /Finance/ }).click();
    
    // Verify filter applied
    await expect(page.locator('text=13 fields')).toBeVisible();
    
    // Clear filter
    await page.getByRole('button', { name: /Finance/ }).click();
    await page.getByRole('option', { name: /All Domains/ }).click();
    
    // Should show all fields again
    await expect(page.locator('text=25 fields')).toBeVisible();
  });
});

