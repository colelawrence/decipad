import { expect, Page, BrowserContext, test } from '@playwright/test';
import { setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { snapshot } from '../utils/src';

test.describe('Icons on the editor title', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();
    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );
    await waitForEditorToLoad(page);
  });

  test('renders the initial color and icon', async () => {
    const notebookIconButton = page.getByTestId('notebook-icon');

    await expect(notebookIconButton.locator('title')).toHaveText(
      'Decipad Logo'
    );
    const initialColor = await notebookIconButton.evaluate((el) => {
      return getComputedStyle(el).backgroundColor;
    });

    expect(initialColor).toBe('rgb(245, 247, 250)'); // grey100
  });

  test('changes the icon', async () => {
    await page.locator('button[aria-haspopup="dialog"]').click();
    await page.getByTestId('icon-picker-Moon').click();

    await expect(
      page.locator('button[aria-haspopup="dialog"] title')
    ).toHaveText('Moon');
  });

  test('changes the color of the icon', async () => {
    await page.locator('button[aria-haspopup="dialog"]').click();
    await page.getByTestId('icon-color-picker-Sulu').click();
    await expect(page.getByText('Pick a style')).toBeVisible();
    await snapshot(page as Page, 'Notebook: Icon selection');
  });
});
