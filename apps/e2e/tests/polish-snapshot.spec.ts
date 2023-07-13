import { BrowserContext, Page, test } from '@playwright/test';
import stringify from 'json-stringify-safe';
import polish from '../__fixtures__/007-polish.json';
import { setUp, waitForEditorToLoad } from '../utils/page/Editor';
import {
  Timeouts,
  createWorkspace,
  importNotebook,
  snapshot,
} from '../utils/src';

test.describe('Use case: building a candle business', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  let workspaceId: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

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

  test('loads and computes the "polish notebook"', async () => {
    const notebookId = await importNotebook(
      workspaceId,
      Buffer.from(stringify(polish), 'utf-8').toString('base64'),
      page
    );

    await page.goto(`/n/${notebookId}`);

    await waitForEditorToLoad(page);

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay + Timeouts.computerDelay);

    await snapshot(page as Page, 'Notebook: Polish check');
  });
});
