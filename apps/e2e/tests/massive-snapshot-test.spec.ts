import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  getPadName,
  navigateToNotebook,
  navigateToNotebookWithClassicUrl,
  setUp,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import {
  createWorkspace,
  importNotebook,
  snapshot,
  withTestUser,
} from '../utils/src';
import notebookSource from '../__fixtures__/001-notebook';

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
      JSON.stringify(notebookSource),
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
      await page.$(
        'text=You can change the participation and multiplier above, and it will be reflected in the calculation below'
      )
    ).toBeDefined();

    await page.waitForSelector('text="This is a string"');

    await snapshot(page as Page, 'Notebook: All elements');
  });

  test('click publish button and extract text', async () => {
    await page.click('text=Publish');
    await page.click('[aria-roledescription="enable publishing"]');

    await snapshot(page as Page, 'Notebook: Publish Popover');
  });

  test('old-style URLs work and pass on search params', async () => {
    await navigateToNotebookWithClassicUrl(
      page,
      notebookId,
      '?searchParam=foo'
    );
    // some time for the notebook to render
    await waitForEditorToLoad(page);
    expect(await getPadName(page)).toBe('Everything, everywhere, all at once');
    expect(new URL(page.url()).searchParams.get('searchParam')).toEqual('foo');
  });

  test('navigates to published notebook link', async () => {
    await page.click('button:has-text("Publish")');
    await page.waitForSelector(
      '[aria-roledescription="enable publishing"] >> visible=true'
    );
    await page.click('[aria-roledescription="enable publishing"]');
    await page.click('[aria-roledescription="enable publishing"]');
    await page.waitForSelector('role=button[name="Link Copy"]');

    publishedNotebookPage = await randomUser.newPage();

    await withTestUser({ context: randomUser, page: publishedNotebookPage });

    await navigateToNotebook(publishedNotebookPage, notebookId);

    await waitForEditorToLoad(publishedNotebookPage);
    // make sure screenshot is captured
    expect(publishedNotebookPage).toBeDefined();
  });

  test('a random user can duplicate', async () => {
    await publishedNotebookPage.click('text=Duplicate notebook');

    await waitForEditorToLoad(publishedNotebookPage);
    await publishedNotebookPage.waitForSelector(
      'text="Everything, everywhere, all at once"'
    );

    expect(
      await publishedNotebookPage.$$('[data-slate-editor] p')
    ).toHaveLength(30);
  });

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
