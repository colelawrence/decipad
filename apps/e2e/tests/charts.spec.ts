import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  focusOnBody,
  setUp,
  editorTitleLocator,
  navigateToNotebook,
  waitForEditorToLoad,
  waitForNotebookToLoad,
} from '../utils/page/Editor';
import { createTable, getFromTable, writeInTable } from '../utils/page/Table';
import {
  snapshot,
  Timeouts,
  createWorkspace,
  importNotebook,
  withTestUser,
} from '../utils/src';

import stringify from 'json-stringify-safe';
import notebookSource from '../__fixtures__/002-notebook-charts.json';

test.describe('Charts', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

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

  test('creates table', async () => {
    await focusOnBody(page);
    await createTable(page);
  });

  test('fills table', async () => {
    // first column
    await writeInTable(page, 'Imports', 1, 0);
    expect(await getFromTable(page, 1, 0)).toBe('Imports');
    await writeInTable(page, 'Hydro, wind and solar', 2, 0);
    expect(await getFromTable(page, 2, 0)).toBe('Hydro, wind and solar');
    await writeInTable(page, 'Bioenergy', 3, 0);
    expect(await getFromTable(page, 3, 0)).toBe('Bioenergy');

    // second column
    await writeInTable(page, '0.68%', 1, 1);
    expect(await getFromTable(page, 1, 1)).toBe('0.68%');
    await writeInTable(page, '3.02%', 2, 1);
    expect(await getFromTable(page, 2, 1)).toBe('3.02%');
    await writeInTable(page, '9.32%', 3, 1);
    expect(await getFromTable(page, 3, 1)).toBe('9.32%');
  });

  test('creates a pie chart', async () => {
    await page.getByTestId('create-chart-from-table-button').click();
    await page.getByTestId('create-chart:arc').click();

    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight * 2)
    );
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
  });

  test('pie chart looks ok', async () => {
    await page.evaluate(() => document.fonts.ready);
  });

  test('updates chart caption', async () => {
    await page.getByPlaceholder('Chart caption').dblclick();
    await page.keyboard.type('I like this caption');
    await page.isVisible("text='I like this caption'");
  });

  test('test pie chart menu', async () => {
    await page.evaluate(() => document.fonts.ready);
    await page.getByTestId('chart-settings-button').click();
  });

  test('change color scheme', async () => {
    await page.evaluate(() => document.fonts.ready);
    await page.getByText('Color scheme').click();
    await page.getByText('Monochrome').click();
    await page.getByText('Purple').click();
  });

  test('convert to bar chart', async () => {
    await page.evaluate(() => document.fonts.ready);
    await page.getByTestId('chart-settings-button').click();
    await page.getByText('Chart type').click();
    await page.getByTestId('chart__settings__chart-type__bar').click();
  });

  test('bar chart menu', async () => {
    await page.evaluate(() => document.fonts.ready);
    await page.getByTestId('chart-settings-button').click();
  });

  test('swap axes', async () => {
    await page.evaluate(() => document.fonts.ready);
    await page.getByText('label').click();
    await page.getByTestId('chart__settings__label__Column2').click();

    await page.getByTestId('chart-settings-button').click();
    await page.getByRole('menuitem', { name: 'Value Column2' }).click();
    await page.getByTestId('chart__settings__value__Column1').click();
  });

  test('convert to scatter chart', async () => {
    await page.evaluate(() => document.fonts.ready);
    await page.getByTestId('chart-settings-button').click();
    await page.getByText('Chart type').click();
    await page.getByTestId('chart__settings__chart-type__point').click();
  });

  test('scatter plot menu', async () => {
    await page.evaluate(() => document.fonts.ready);
    await page.getByTestId('chart-settings-button').click();
    await snapshot(page as Page, 'Notebook: Last chart');
  });
});

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
    incognito.clearCookies();

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
    await expect(page.locator(editorTitleLocator())).toHaveText(
      'Testing Visual Regression Charts'
    );

    await page.getByText('Start Test Here').waitFor();

    await page.isVisible('[data-testid="chart-styles"]');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
    await snapshot(page as Page, 'Notebook: Charts');
  });

  test('click publish button and extract text', async () => {
    await page.getByRole('button', { name: 'Share' }).click();
    await page.getByTestId('publish-tab').click();
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
