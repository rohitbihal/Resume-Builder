const { test, expect } = require('@playwright/test');

test.describe('Resume Builder Flow', () => {
  test('User can reach the dashboard from landing page', async ({ page }) => {
    // 1. Visit landing page
    await page.goto('/');
    
    // 2. Click Build My Resume now
    const cta = page.locator('a:has-text("Build My Resume"), a:has-text("Start Building")').first();
    await expect(cta).toBeVisible();
    await cta.click();

    // 3. Ensure we arrive at role selection or builder if already past role selection
    await expect(page).toHaveURL(/.*(dashboard|builder|#)/);
  });

  test('Builder inner UI elements render without crashing', async ({ page }) => {
    // Force direct landing to builder
    await page.goto('/builder');
    
    // Check if the builder form rendered
    await expect(page.locator('text=Personal Details')).toBeVisible();
    await expect(page.locator('text=Executive Summary')).toBeVisible();

    // Check if the preview pane exists 
    await expect(page.locator('.cr-resume-preview, #cv-preview, .preview-container').first()).toBeVisible({ timeout: 10000 });
  });
});
