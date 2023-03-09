import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  getPadName,
  navigateToNotebook,
  setUp,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import {
  createWorkspace,
  importNotebook,
  snapshot,
  withTestUser,
} from '../utils/src';
import notebookSource from '../__fixtures__/001-notebook.json';

test.describe('Loading and snapshot of big notebook', () => {
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
    context = await page.context();
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

  test('navigates to notebook and loads it', async () => {
    await navigateToNotebook(page, notebookId);
    // some time for the notebook to render
    await waitForEditorToLoad(page);
    expect(await getPadName(page)).toBe('Everything, everywhere, all at once');

    expect(
      // eslint-disable-next-line playwright/no-element-handle
      await page.$(
        'text=You can change the participation and multiplier above, and it will be reflected in the calculation below'
      )
    ).toBeDefined();

    await page.waitForSelector('text="This is a string"');

    await snapshot(page as Page, 'Notebook: All elements');
  });

  test('click publish button and extract text', async () => {
    await page.getByRole('button', { name: 'Publish' }).click();
    await page.locator('[aria-roledescription="enable publishing"]').click();
    await snapshot(page as Page, 'Notebook: Publish Popover');
  });

  // eslint-disable-next-line playwright/no-skipped-test
  test('navigates to published notebook link', async () => {
    await page.waitForSelector('role=button[name="Link Copy"]');

    publishedNotebookPage = await randomUser.newPage();

    await withTestUser({ context: randomUser, page: publishedNotebookPage });

    await navigateToNotebook(publishedNotebookPage, notebookId);

    await waitForEditorToLoad(publishedNotebookPage);
    // make sure screenshot is captured
    expect(publishedNotebookPage).toBeDefined();
  });

  // eslint-disable-next-line playwright/no-skipped-test
  test('a random user can duplicate', async () => {
    await publishedNotebookPage.click('text=Duplicate notebook');

    await waitForEditorToLoad(publishedNotebookPage);
    await publishedNotebookPage.waitForSelector(
      'text="Everything, everywhere, all at once"'
    );

    await expect(page.locator('[data-testid="paragraph-wrapper"]')).toHaveCount(
      21
    );
    await expect(page.locator('[data-slate-editor] p')).toHaveCount(7);
  });

  // TODO: ENG-1891 fix this test
  // eslint-disable-next-line playwright/no-skipped-test
  test('navigates to published notebook link incognito', async () => {
    publishedNotebookPage = (await incognito.newPage()) as Page;

    await navigateToNotebook(publishedNotebookPage, notebookId);
    await waitForEditorToLoad(publishedNotebookPage);
    // make sure screenshot is captured
    expect(publishedNotebookPage).toBeDefined();

    // Magic numbers are delayed
    await page.waitForSelector('text="This is a string"');

    await snapshot(
      publishedNotebookPage,
      'Notebook: Published mode (incognito)',
      {
        mobile: true,
      }
    );
  });
});
