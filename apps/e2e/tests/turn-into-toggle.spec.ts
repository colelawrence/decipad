import { BrowserContext, Page, expect, test } from '@playwright/test';
import { createWithSlashCommand } from '../utils/page/Block';
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
    await createWithSlashCommand(page, '/input', 'input');
    await page.locator('article').getByTestId('drag-handle').first().click();

    page.getByText('Turn into').waitFor();
    await page.getByText('Turn into').click();
    await page.getByRole('menuitem').getByText('Toggle').waitFor();
    await page.getByRole('menuitem').getByText('Toggle').click();

    await expect(page.getByTestId('widget-editor:false')).toBeHidden();
  });
});
