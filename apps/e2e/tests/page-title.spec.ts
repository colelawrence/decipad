import { expect, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';

test.describe('Page title is the same as notebook', () => {
  test.beforeEach(async ({ page, context }) => {
    await setUp({ page, context }, { createAndNavigateToNewPad: true });
  });

  test('Initial page is the same as new notebook page', async ({ page }) => {
    await expect(page).toHaveTitle('Welcome to Decipad! | Decipad');
  });

  test('Title should change if notebook title changes', async ({ page }) => {
    const title = page.getByTestId('editor-title');

    await title.selectText();
    await page.keyboard.press('Backspace');
    await page.keyboard.type('My New Title');

    await expect(page).toHaveTitle('My New Title | Decipad');
  });
});
