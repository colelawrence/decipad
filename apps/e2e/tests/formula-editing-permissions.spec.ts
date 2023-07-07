import { BrowserContext, expect, Page, test } from '@playwright/test';
import notebookSource from '../__fixtures__/004-testing-edit-permissions.json';
import {
  navigateToNotebook,
  setUp,
  waitForEditorToLoad,
  waitForNotebookToLoad,
} from '../utils/page/Editor';
import { createWorkspace, importNotebook, withTestUser } from '../utils/src';

export const typeTest = (currentPage: Page, input: string) =>
  test.step('Trying to add text to formulas', async () => {
    await currentPage.getByTestId('code-line').type(input);
  });

test.describe('Loading reference notebook', () => {
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

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: false,
      }
    );
    workspaceId = await createWorkspace(page);
    notebookId = await importNotebook(
      workspaceId,
      Buffer.from(JSON.stringify(notebookSource), 'utf-8').toString('base64'),
      page
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Waiting for editor to be ready', async () => {
    await navigateToNotebook(page, notebookId);
    await waitForEditorToLoad(page);
    await expect(
      page.getByTestId('[data-test-id="editor-table"]')
    ).toBeDefined();
  });

  test('Modifying table formula as notebook owner', async () => {
    await page.getByTestId('code-line').click();
    await page.getByTestId('code-line').fill('A + 2 + 5');
    await expect(page.getByText('8')).toBeVisible();
  });

  test('Publish notebook and navigate to it as a random user', async () => {
    await page.getByRole('button', { name: 'Publish' }).click();
    await page.locator('[aria-roledescription="enable publishing"]').click();

    publishedNotebookPage = await randomUser.newPage();

    await withTestUser({ context: randomUser, page: publishedNotebookPage });

    await navigateToNotebook(publishedNotebookPage, notebookId);

    await waitForNotebookToLoad(publishedNotebookPage);
    expect(publishedNotebookPage).toBeDefined();
  });

  test('Random user tries to edit', async () => {
    await typeTest(publishedNotebookPage, 'A');
    await expect(publishedNotebookPage.getByText('8')).toBeVisible();
  });

  test('Navigating to notebook as an incognito user', async () => {
    publishedNotebookPage = (await incognito.newPage()) as Page;
    await navigateToNotebook(publishedNotebookPage, notebookId);
    await waitForNotebookToLoad(publishedNotebookPage);
    expect(publishedNotebookPage).toBeDefined();
  });

  test('Incognito user tries to edit', async () => {
    await typeTest(publishedNotebookPage, 'A');
    await expect(publishedNotebookPage.getByText('8')).toBeVisible();
  });
});
