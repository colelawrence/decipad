import { BrowserContext, Page } from 'playwright';
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
  let sharedNotebookLink: string;
  let sharedNotebookPage: Page;
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

    expect(await page.$('text=756,869,701')).toBeDefined();
    // Magic numbers are delayed
    expect((await page.$$('text="This is a string"')).length).toBeGreaterThan(
      0
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

  it('navigates to shared notebook link', async () => {
    const linkSelector = 'text=//n/Everything-everywhere-all-at-once/';
    await page.click('text=share');
    await page.click('[aria-roledescription="enable sharing"]');

    await page.waitForSelector(linkSelector);

    sharedNotebookLink = await page.innerText(linkSelector);
    expect(sharedNotebookLink.length).toBeGreaterThan(0);
    const newContext = (await browser.newContext()) as BrowserContext;
    sharedNotebookPage = await newContext.newPage();

    await withTestUser({ ctx: newContext, p: sharedNotebookPage });

    await sharedNotebookPage.goto(sharedNotebookLink);
    await waitForEditorToLoad(sharedNotebookPage);
    // make sure screenshot is captured
    expect(page).toBeDefined();
  });

  it('navigates to shared notebook link incognito', async () => {
    const newContext = await browser.newContext();
    sharedNotebookPage = (await newContext.newPage()) as Page;

    await sharedNotebookPage.goto(sharedNotebookLink);
    await waitForEditorToLoad(sharedNotebookPage);
    // make sure screenshot is captured
    expect(sharedNotebookPage).toBeDefined();

    await snapshot(sharedNotebookPage, 'Notebook: Published mode (incognito)');
  });
});
