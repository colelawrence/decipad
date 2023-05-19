import stringify from 'json-stringify-safe';
import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  getPadName,
  navigateToNotebook,
  setUp,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import { createWorkspace, importNotebook, Timeouts } from '../utils/src';
import notebookSource from '../__fixtures__/003-notebook-negative-numbers.json';

test.describe('Loading and snapshot of notebook with charts', () => {
  test.describe.configure({ mode: 'serial' });

  let notebookId: string;
  let workspaceId: string;
  let page: Page;
  let context: BrowserContext;
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
    expect(await getPadName(page)).toBe('Negative Calculations Checks');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
  });

  test('checks for errors', async () => {
    // note: This will stop picking up errors if we change the icon of loading
    const hasMagicErrors = await page.locator(
      'p span >svg title:has-text("Loading")'
    );

    // note: This will stop picking up errors if we change the icon of errors
    const hasCodelineErrors = await page.locator(
      'output span >svg title:has-text("Warning")'
    );

    // note: This will stop picking up errors if we change the text of an error block
    const hasErrorBlock = await page.locator('text=Delete this block');

    const mEC = await hasMagicErrors.count();
    const cEC = await hasCodelineErrors.count();
    const bEC = await hasErrorBlock.count();

    // See if it has magic errors
    expect.soft(mEC, `magic errors`).toBe(0);

    // See if it has errors in calculations
    expect.soft(cEC, `calculation errors`).toBe(0);

    // See if it has error blocks
    expect.soft(bEC, `broken blocks`).toBe(0);
  });
});
