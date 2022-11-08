import { BrowserContext, Page } from 'playwright';
import waitForExpect from 'wait-for-expect';
import {
  getPadName,
  navigateToNotebook,
  navigateToNotebookWithClassicUrl,
  setUp,
  waitForEditorToLoad,
} from './page-utils/Pad';
import { snapshot, withTestUser } from './utils';
import notebookSource from './__fixtures__/001-notebook';
import { createWorkspace } from './utils/create-workspace';
import { importNotebook } from './utils/import-notebook';

describe('notebook load json', () => {
  let publishedNotebookLink: string;
  let publishedNotebookPage: Page;
  let notebookId: string;

  beforeAll(async () => {
    await setUp({
      createAndNavigateToNewPad: false,
    });
  });

  beforeAll(async () => {
    // create workspace
    const workspaceId = await createWorkspace();
    notebookId = await importNotebook(
      workspaceId,
      JSON.stringify(notebookSource)
    );
  });

  it('navigates to notebook and loads it', async () => {
    await navigateToNotebook(notebookId);
    // some time for the notebook to render
    await page.waitForTimeout(1000);
    await waitForEditorToLoad();
    expect(await getPadName()).toBe('Everything, everywhere, all at once');

    expect(
      await page.$(
        'text=You can change the participation and multiplier above, and it will be reflected in the calculation below'
      )
    ).toBeDefined();

    await waitForExpect(async () =>
      expect(await page.$('text=756,869,701')).toBeDefined()
    );
    // Magic numbers are delayed
    await waitForExpect(async () =>
      expect((await page.$$('text="This is a string"')).length).toBeGreaterThan(
        0
      )
    );

    await snapshot(page as Page, 'Notebook: All elements');
  });

  it('old-style URLs work and pass on search params', async () => {
    await navigateToNotebookWithClassicUrl(notebookId, '?searchParam=foo');
    // some time for the notebook to render
    await page.waitForTimeout(1000);
    await waitForEditorToLoad();
    expect(await getPadName()).toBe('Everything, everywhere, all at once');
    expect(new URL(page.url()).searchParams.get('searchParam')).toEqual('foo');
  });

  it('navigates to published notebook link', async () => {
    const linkSelector = 'text=//n/Everything-everywhere-all-at-once/';
    await page.click('button:has-text("Publish")');
    await page.click('[aria-roledescription="enable publishing"]');

    await page.waitForSelector(linkSelector);

    publishedNotebookLink = await page.innerText(linkSelector);
    expect(publishedNotebookLink.length).toBeGreaterThan(0);
    const newContext = (await browser.newContext()) as BrowserContext;
    publishedNotebookPage = await newContext.newPage();

    await withTestUser({ ctx: newContext, p: publishedNotebookPage });

    await publishedNotebookPage.goto(publishedNotebookLink);
    await waitForEditorToLoad(publishedNotebookPage);
    // make sure screenshot is captured
    expect(page).toBeDefined();
  });

  it('navigates to published notebook link incognito', async () => {
    const newContext = await browser.newContext();
    publishedNotebookPage = (await newContext.newPage()) as Page;

    await publishedNotebookPage.goto(publishedNotebookLink);
    await waitForEditorToLoad(publishedNotebookPage);
    // make sure screenshot is captured
    expect(publishedNotebookPage).toBeDefined();

    // Magic numbers are delayed
    expect(
      (await publishedNotebookPage.$$('text="This is a string"')).length
    ).toBeGreaterThan(0);

    await snapshot(
      publishedNotebookPage,
      'Notebook: Published mode (incognito)',
      {
        mobile: true,
      }
    );
  });
});
