import { expect, Page, test } from '@playwright/test';
import { goToPlayground, waitForEditorToLoad } from '../utils/page/Editor';
import { snapshot } from '../utils/src';

test.describe('Icons on the editor title', () => {
  test.beforeEach(async ({ page }) => {
    await goToPlayground(page);
    await waitForEditorToLoad(page);
  });

  test('renders the initial color and icon', async ({ page }) => {
    const button = page.locator('button[aria-haspopup="dialog"]');
    expect(await button.locator('title').textContent()).toBe('Rocket');
    const initialColor = await button.evaluate((el) => {
      return getComputedStyle(el).backgroundColor;
    });

    expect(initialColor).toBe('rgb(236, 240, 246)'); // grey200
  });

  test('changes the icon', async ({ page }) => {
    const button = page.locator('button[aria-haspopup="dialog"]');
    await button.click();

    const moon = await page.waitForSelector('button[aria-label="Moon"]');
    await moon?.click();

    expect(
      await page.locator('button[aria-haspopup="dialog"] title').textContent()
    ).toBe('Moon');
  });

  test('changes the color of the icon', async ({ page }) => {
    const button = page.locator('button[aria-haspopup="dialog"]');
    await button.click();

    const green = await page.waitForSelector('button[aria-label="Sulu"]');
    await green?.click();

    await snapshot(page as Page, 'Notebook: Icon selection');
  });
});
