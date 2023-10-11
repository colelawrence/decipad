import { expect, test } from '@playwright/test';
import { focusOnBody, setUp, waitForEditorToLoad } from '../utils/page/Editor';

test.describe('Keyboard shortcuts', () => {
  test.beforeEach(async ({ context, page }) => {
    await setUp({ page, context }, { createAndNavigateToNewPad: true });
    await waitForEditorToLoad(page);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('Undo keyboard shortcuts', async ({ page }) => {
    await focusOnBody(page);
    await page.keyboard.type('Hello');

    const text = page.locator('text="Hello"');

    await expect(text).toBeVisible();

    await page.keyboard.press('Control+z');
    await expect(text).toBeHidden();

    await page.keyboard.press('Control+Shift+z');
    await expect(text).toBeVisible();
  });
});
