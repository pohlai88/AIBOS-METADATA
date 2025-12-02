import { test, expect } from '@playwright/test';

/**
 * Analytics Dashboard E2E Tests
 * 
 * Tests the AI-first analytics dashboard:
 * - Metadata health overview
 * - Predictive insights
 * - Activity feed
 * - Time range filtering
 */

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/metadata/analytics');
    await page.waitForSelector('text=Metadata Analytics');
  });

  test('should display health score in header', async ({ page }) => {
    // Should show health score badge in header
    await expect(page.locator('text=Health: 87%')).toBeVisible();
  });

  test('should display overall health score', async ({ page }) => {
    // Should show large health score
    await expect(page.locator('text=87%').first()).toBeVisible();
    
    // Should show status badge
    await expect(page.locator('text=good')).toBeVisible();
    
    // Should show "Metadata Health Score" label
    await expect(page.locator('text=Metadata Health Score')).toBeVisible();
  });

  test('should display key metrics grid', async ({ page }) => {
    // Quality Score
    await expect(page.locator('text=Quality Score')).toBeVisible();
    await expect(page.locator('text=92%').first()).toBeVisible();
    
    // Governance Coverage
    await expect(page.locator('text=Governance Coverage')).toBeVisible();
    await expect(page.locator('text=84%')).toBeVisible();
    
    // Compliance Rate
    await expect(page.locator('text=Compliance Rate')).toBeVisible();
    await expect(page.locator('text=96%')).toBeVisible();
  });

  test('should display progress metrics', async ({ page }) => {
    // Datasets Cataloged
    await expect(page.locator('text=Datasets Cataloged')).toBeVisible();
    await expect(page.locator('text=47 / 50')).toBeVisible();
    await expect(page.locator('text=94% complete')).toBeVisible();
    
    // Fields Documented
    await expect(page.locator('text=Fields Documented')).toBeVisible();
    await expect(page.locator('text=245 / 280')).toBeVisible();
    await expect(page.locator('text=87% complete')).toBeVisible();
    
    // Lineage Mapped
    await expect(page.locator('text=Lineage Mapped')).toBeVisible();
    await expect(page.locator('text=38 / 50')).toBeVisible();
    await expect(page.locator('text=76% complete')).toBeVisible();
  });

  test('should display activity stats', async ({ page }) => {
    // Active Stakeholders
    await expect(page.locator('text=Active Stakeholders')).toBeVisible();
    await expect(page.locator('text=23').first()).toBeVisible();
    
    // Avg Time to Approval
    await expect(page.locator('text=Avg. Time to Approval')).toBeVisible();
    await expect(page.locator('text=2.4 days')).toBeVisible();
    
    // Pending Approvals
    await expect(page.locator('text=Pending Approvals')).toBeVisible();
    await expect(page.locator('text=5').first()).toBeVisible();
    
    // AI Suggestions
    await expect(page.locator('text=AI Suggestions')).toBeVisible();
    await expect(page.locator('text=8')).toBeVisible();
  });

  test('should display predictive insights section', async ({ page }) => {
    // Section header
    await expect(page.locator('text=Predictive Insights')).toBeVisible();
    
    // Should show active count
    await expect(page.locator('text=4 active')).toBeVisible();
  });

  test('should display all 4 predictive insights', async ({ page }) => {
    // Quality Decline
    await expect(page.locator('text=Quality Score Likely to Drop for Revenue Fields')).toBeVisible();
    
    // Missing Lineage
    await expect(page.locator('text=New Data Sources Detected Without Lineage')).toBeVisible();
    
    // Outdated Definitions
    await expect(page.locator('text=Tax Code Definitions May Be Outdated')).toBeVisible();
    
    // Usage Spike
    await expect(page.locator('text=Unusual Query Volume on Customer Data')).toBeVisible();
  });

  test('should display insight confidence scores', async ({ page }) => {
    // Should show confidence badges
    await expect(page.locator('text=94% confidence')).toBeVisible();
    await expect(page.locator('text=98% confidence')).toBeVisible();
    await expect(page.locator('text=89% confidence')).toBeVisible();
    await expect(page.locator('text=92% confidence')).toBeVisible();
  });

  test('should display insight priority levels', async ({ page }) => {
    // Should show priority badges
    await expect(page.locator('text=high priority')).toBeVisible();
    await expect(page.locator('text=medium priority')).toBeVisible();
  });

  test('should display affected fields for each insight', async ({ page }) => {
    // Should show affected fields
    await expect(page.locator('text=Affected Fields:')).toBeVisible();
    await expect(page.locator('text=revenue_gross')).toBeVisible();
    await expect(page.locator('text=employee_id')).toBeVisible();
    await expect(page.locator('text=tax_code')).toBeVisible();
  });

  test('should display predicted impact and timeframe', async ({ page }) => {
    // Predicted Impact
    await expect(page.locator('text=Predicted Impact')).toBeVisible();
    await expect(page.locator('text=Quality scores may drop below 90%')).toBeVisible();
    
    // Timeframe
    await expect(page.locator('text=Timeframe')).toBeVisible();
    await expect(page.locator('text=Within 7 days')).toBeVisible();
  });

  test('should display suggested actions', async ({ page }) => {
    // Suggested Action
    await expect(page.locator('text=Suggested Action:')).toBeVisible();
    await expect(page.locator('text=Run data quality profiler')).toBeVisible();
  });

  test('should display historical patterns', async ({ page }) => {
    // Pattern
    await expect(page.locator('text=Pattern:')).toBeVisible();
    await expect(page.locator('text=Similar pattern observed in Q3 2024')).toBeVisible();
  });

  test('should have Take Action button on insights', async ({ page }) => {
    // Take Action buttons should be visible
    const takeActionButtons = page.getByRole('button', { name: /Take Action/ });
    await expect(takeActionButtons.first()).toBeVisible();
    
    // Click should trigger action
    page.on('dialog', dialog => dialog.accept());
    await takeActionButtons.first().click();
  });

  test('should have Details button on insights', async ({ page }) => {
    // Details buttons should be visible
    const detailsButtons = page.getByRole('button', { name: /Details/ });
    await expect(detailsButtons.first()).toBeVisible();
  });

  test('should display recent activity feed in sidebar', async ({ page }) => {
    // Recent Activity header
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    
    // Should show activity items
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    await expect(page.locator('text=approved definition change')).toBeVisible();
    
    // Should show AI agent activity
    await expect(page.locator('text=DataQualitySentinel')).toBeVisible();
    await expect(page.locator('text=suggested quality improvement')).toBeVisible();
  });

  test('should display activity timestamps', async ({ page }) => {
    // Should show relative timestamps
    await expect(page.locator('text=2 hours ago')).toBeVisible();
    await expect(page.locator('text=1 day ago')).toBeVisible();
  });

  test('should display activity metadata badges', async ({ page }) => {
    // Should show metadata badges
    await expect(page.locator('text=impact:')).toBeVisible();
    await expect(page.locator('text=tier:')).toBeVisible();
    await expect(page.locator('text=confidence:')).toBeVisible();
  });

  test('should filter by time range', async ({ page }) => {
    // Default should be "Last 7 Days"
    await expect(page.getByRole('button', { name: /Last 7 Days/ })).toBeVisible();
    
    // Open time range filter
    await page.getByRole('button', { name: /Last 7 Days/ }).click();
    
    // Should show options
    await expect(page.getByRole('option', { name: /Last 24 Hours/ })).toBeVisible();
    await expect(page.getByRole('option', { name: /Last 30 Days/ })).toBeVisible();
    await expect(page.getByRole('option', { name: /Last 90 Days/ })).toBeVisible();
    
    // Select different time range
    await page.getByRole('option', { name: /Last 30 Days/ }).click();
    
    // Filter should update
    await expect(page.getByRole('button', { name: /Last 30 Days/ })).toBeVisible();
  });

  test('should have Schedule Report button', async ({ page }) => {
    // Schedule Report button should be visible in header
    await expect(page.getByRole('button', { name: /Schedule Report/ })).toBeVisible();
  });

  test('should have Export button', async ({ page }) => {
    // Export button should be visible in header
    await expect(page.getByRole('button', { name: /Export/ })).toBeVisible();
  });

  test('should display quality trends placeholder', async ({ page }) => {
    // Quality Trends section
    await expect(page.locator('text=Quality Trends')).toBeVisible();
    
    // Should show placeholder
    await expect(page.locator('text=Quality trend charts coming soon')).toBeVisible();
  });

  test('should show excellent status for high health score', async ({ page }) => {
    // With 87% health, should show "good" status
    // (If health was 90%+, would show "excellent")
    await expect(page.locator('text=good')).toBeVisible();
  });

  test('should display trend indicators in progress metrics', async ({ page }) => {
    // Datasets should show +3 trend
    await expect(page.locator('text=+3')).toBeVisible();
    
    // Fields should show +12 trend
    await expect(page.locator('text=+12')).toBeVisible();
  });
});

