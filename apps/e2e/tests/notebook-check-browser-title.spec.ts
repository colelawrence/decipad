import { expect, test, BrowserContext, Page } from '@playwright/test';
import { setUp, waitForEditorToLoad } from '../utils/page/Editor';

test.describe('page title is the same as notebook @browser @notebook', () => {
  let page: Page;
  let context: BrowserContext;

  test.describe.configure({ mode: 'serial' });
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('initial page title is the same as new notebook', async () => {
    await expect(page).toHaveTitle('Welcome to Decipad! | Decipad');
  });

  test('page title changes when notebook title changes', async () => {
    const title = page.getByTestId('editor-title');

    await title.selectText();
    await page.keyboard.press('Backspace');
    await page.keyboard.type('My New Title');
    await expect(page).toHaveTitle('My New Title | Decipad');
  });

  test('check page title persists after going to workspace and back', async () => {
    await page.getByTestId('go-to-workspace').click();
    await page.getByText('My New Title').click();
    await waitForEditorToLoad(page);
    await expect(page).toHaveTitle('My New Title | Decipad');
  });
});
