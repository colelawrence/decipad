import { expect, Page, test } from '@playwright/test';
import { goToPlayground, waitForEditorToLoad } from '../utils/page/Editor';
import { snapshot } from '../utils/src';

test.describe('Icons on the editor title', () => {
  test.beforeEach(async ({ page }) => {
    await goToPlayground(page);
    await waitForEditorToLoad(page);
  });

  test('renders the initial color and icon', async ({ page }) => {
    const notebookIconButton = page.getByTestId('notebook-icon');

    await expect(notebookIconButton.locator('title')).toHaveText('Rocket');
    const initialColor = await notebookIconButton.evaluate((el) => {
      return getComputedStyle(el).backgroundColor;
    });

    expect(initialColor).toBe('rgb(236, 240, 246)'); // grey200
  });

  test('changes the icon', async ({ page }) => {
    await page.locator('button[aria-haspopup="dialog"]').click();
    await page.locator('[data-testid="icon-picker-Moon"]').click();

    await expect(
      page.locator('button[aria-haspopup="dialog"] title')
    ).toHaveText('Moon');
  });

  test('changes the color of the icon', async ({ page }) => {
    await page.locator('button[aria-haspopup="dialog"]').click();
    await page.locator('[data-testid="icon-color-picker-Sulu"]').click();

    await snapshot(page as Page, 'Notebook: Icon selection');
  });
});
