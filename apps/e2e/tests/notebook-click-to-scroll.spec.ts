import { BrowserContext, expect, Page, test } from '@playwright/test';
import { waitForEditorToLoad, setUp } from '../utils/page/Editor';
import stringify from 'json-stringify-safe';
import startingACandleBusiness from '../__fixtures__/gallery/apple-model.json';
import { importNotebook, createWorkspace, Timeouts } from '../utils/src';

test.describe('check notebook scroll with clicks', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  let initialscrollPosition: number;
  let newscrollPosition: number;
  let workspaceId: string;
  let notebookId: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: false,
      }
    );
    workspaceId = await createWorkspace(page);
  });
  test.afterAll(async () => {
    await page.close();
  });

  test('check go to definition scroll', async () => {
    // need to import notebook, not on the default workspace for the test we need
    notebookId = await importNotebook(
      workspaceId,
      Buffer.from(stringify(startingACandleBusiness), 'utf-8').toString(
        'base64'
      ),
      page
    );

    await page.goto(`/n/${notebookId}`);

    await waitForEditorToLoad(page);
    // hover a variable from the notebook
    await page.locator('code').getByText('Historicals').nth(0).hover();
    initialscrollPosition = await page.evaluate(() => {
      return window.scrollY;
    });
    await page.getByTestId('go-to-definition').click();
    // wait for scroll
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);

    newscrollPosition = await page.evaluate(() => {
      return window.scrollY;
    });
    expect(initialscrollPosition !== newscrollPosition).toBeTruthy();
  });

  test('check go catalog titles scrool', async () => {
    await page.getByTestId('segment-button-trigger-top-bar-sidebar').click();
    await page.getByTestId('sidebar-Data').click();

    initialscrollPosition = await page.evaluate(() => {
      return window.scrollY;
    });
    await page
      .getByTestId('number-catalog-link')
      .filter({ hasText: 'Step 3' })
      .click();
    // wait for scroll
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);

    newscrollPosition = await page.evaluate(() => {
      return window.scrollY;
    });
    expect(initialscrollPosition !== newscrollPosition).toBeTruthy();
  });
});
