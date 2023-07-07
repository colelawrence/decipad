import { BrowserContext, Page, test, expect } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import { createWorkspace } from '../utils/src';

test.describe('Make sure the toggle conversion works', () => {
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

    await createWorkspace(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Checks all the files', async () => {
    await page.getByTestId('paragraph-content').last().fill('/i');

    await page.getByTestId('menu-item-input').waitFor();
    await page.getByTestId('menu-item-input').click();
    await page.getByTestId('drag-handle').first().click();

    page.getByText('Turn into').waitFor();
    await page.getByText('Turn into').click();

    await page.getByText('Toggle').waitFor();
    await page.getByText('Toggle').click();

    await expect(page.getByTestId('widget-editor:false')).toBeHidden();
  });
});
