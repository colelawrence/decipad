import stringify from 'json-stringify-safe';
import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  setUp,
  waitForEditorToLoad,
  editorTitleLocator,
  navigateToNotebook,
} from '../utils/page/Editor';
import { snapshot, createWorkspace, importNotebook } from '../utils/src';
import notebookSource from '../__fixtures__/009-number-catalogue-test.json';
import { openColTypeMenu } from '../utils/page/Table';

test.describe('Tests the number catalog', () => {
  let page: Page;
  let context: BrowserContext;
  let notebookId: string;
  let workspaceId: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

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

  test('screenshots the number catalog and first article', async () => {
    await navigateToNotebook(page, notebookId);
    // some time for the notebook to render
    await waitForEditorToLoad(page);

    await expect(page.locator(editorTitleLocator())).toHaveText(
      'Number Catalog Test'
    );

    await expect(page.getByTestId('editor-sidebar')).toBeHidden();
    await page.getByTestId('segment-button-trigger-top-bar-sidebar').click();
    await expect(page.getByTestId('editor-sidebar')).toBeVisible();
    await page.getByTestId('sidebar-Data').click();

    // Opening table column menu to save on percy snapshots
    await openColTypeMenu(page, 1, 'TableVariableName');

    await snapshot(page as Page, 'Notebook: Number Catalog');
  });
});
