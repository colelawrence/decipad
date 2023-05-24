import { BrowserContext, expect, Page, test } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import {
  getPadName,
  navigateToNotebook,
  setUp,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import { createWorkspace, importNotebook, Timeouts } from '../utils/src';

const navigateToNotebookPageStep = (
  page: Page,
  notebookId: string,
  notebookTitle?: string
) =>
  test.step(`Navigates to ${notebookId} (${notebookTitle}) notebook and loads it`, async () => {
    await navigateToNotebook(page, notebookId);
    // some time for the notebook to render
    await waitForEditorToLoad(page);
    expect(await getPadName(page)).toContain('[Template]');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
  });

const checkForErrorsStep = (
  page: Page,
  notebookId: string,
  notebookTitle?: string
) =>
  test.step(`Check errors on ${notebookId} (${notebookTitle})`, async () => {
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

test.describe('Check on gallery of templates', () => {
  test.describe.configure({ mode: 'serial' });

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
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('checks all the files', async () => {
    const files = await fs.readdir(
      path.join(__dirname, '..', '__fixtures__', 'gallery')
    );
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    expect(jsonFiles.length).toBeGreaterThan(0);
    for (const file of jsonFiles) {
      const filePath = path.join(
        __dirname,
        '..',
        '__fixtures__',
        'gallery',
        file
      );
      const fileContent = await fs.readFile(filePath, 'utf8');
      const notebookId = await importNotebook(
        workspaceId,
        Buffer.from(fileContent, 'utf-8').toString('base64'),
        page
      );
      await navigateToNotebookPageStep(page, notebookId, file);
      await checkForErrorsStep(page, notebookId, file);
    }
  });
});
