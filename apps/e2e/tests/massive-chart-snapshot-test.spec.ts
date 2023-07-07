import stringify from 'json-stringify-safe';
import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  getPadName,
  navigateToNotebook,
  setUp,
  waitForEditorToLoad,
  waitForNotebookToLoad,
} from '../utils/page/Editor';
import {
  createWorkspace,
  importNotebook,
  snapshot,
  withTestUser,
  Timeouts,
} from '../utils/src';
import notebookSource from '../__fixtures__/002-notebook-charts.json';

test.describe('Loading and snapshot of notebook with charts', () => {
  test.describe.configure({ mode: 'serial' });

  let publishedNotebookPage: Page;
  let notebookId: string;
  let workspaceId: string;
  let page: Page;
  let context: BrowserContext;
  let incognito: BrowserContext;
  let randomUser: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();
    incognito = await browser.newContext();
    randomUser = await browser.newContext();

    await setUp({ page, context });
    workspaceId = await createWorkspace(page);
    notebookId = await importNotebook(
      workspaceId,
      Buffer.from(stringify(notebookSource), 'utf-8').toString('base64'),
      page
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('navigates to notebook and loads it', async () => {
    await navigateToNotebook(page, notebookId);
    // some time for the notebook to render
    await waitForEditorToLoad(page);
    expect(await getPadName(page)).toBe('Testing Visual Regression Charts');

    await page.getByText('Start Test Here').waitFor();

    await page.isVisible('[data-testid="chart-styles"]');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
    await snapshot(page as Page, 'Notebook: Charts');
  });

  test('click publish button and extract text', async () => {
    await page.getByRole('button', { name: 'Publish' }).click();
    await page.locator('[aria-roledescription="enable publishing"]').click();
    await page.getByTestId('copy-published-link').waitFor();
  });

  // eslint-disable-next-line playwright/no-skipped-test
  test('navigates to published notebook link', async () => {
    await page.getByTestId('copy-published-link').waitFor();

    publishedNotebookPage = await randomUser.newPage();

    await withTestUser({ context: randomUser, page: publishedNotebookPage });

    await navigateToNotebook(publishedNotebookPage, notebookId);

    await waitForNotebookToLoad(publishedNotebookPage);
    // make sure screenshot is captured
    expect(publishedNotebookPage).toBeDefined();
  });

  // eslint-disable-next-line playwright/no-skipped-test
  test('a random user can duplicate', async () => {
    await publishedNotebookPage.getByText('Duplicate notebook').click();

    await waitForNotebookToLoad(publishedNotebookPage);
    await publishedNotebookPage
      .getByText('Testing Visual Regression Charts')
      .waitFor();
  });

  // TODO: ENG-1891 fix this test
  // eslint-disable-next-line playwright/no-skipped-test
  test('navigates to published notebook link incognito', async () => {
    publishedNotebookPage = (await incognito.newPage()) as Page;

    await navigateToNotebook(publishedNotebookPage, notebookId);
    await waitForNotebookToLoad(publishedNotebookPage);
    // make sure screenshot is captured
    expect(publishedNotebookPage).toBeDefined();

    // wait for charts to load before snapshot
    await page.isVisible('[data-testid="chart-styles"]');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
    await snapshot(
      publishedNotebookPage,
      'Notebook: Charts Published mode (incognito)',
      {
        mobile: true,
      }
    );
  });
});
