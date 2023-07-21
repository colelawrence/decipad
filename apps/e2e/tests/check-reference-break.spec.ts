import stringify from 'json-stringify-safe';
import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  getPadName,
  navigateToNotebook,
  setUp,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import { createWorkspace, importNotebook, Timeouts } from '../utils/src';
import notebookSource from '../__fixtures__/008-simple-inline-number-notebook.json';

test.describe('Check references break', () => {
  test.describe.configure({ mode: 'serial' });

  let notebookId: string;
  let workspaceId: string;
  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

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
    expect(await getPadName(page)).toBe('Check notebook references');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
  });

  test('deletes calculation to break inline results', async () => {
    await page.locator('article').getByTestId('drag-handle').nth(3).click();

    page.getByText('Delete').waitFor();
    await page.getByText('Delete').click();
  });

  test('checks for errors', async () => {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);

    // note: This will stop picking up errors if we change the icon of errors
    const hasCodelineErrors = page.locator(
      'output span >svg title:has-text("Warning")'
    );

    const cEC = await hasCodelineErrors.count();

    // See if it has errors in calculations
    expect.soft(cEC, `calculation errors`).toBeGreaterThan(0);
  });
});
