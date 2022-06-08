import { Pad, User, WorkspaceRecord } from '@decipad/backendtypes';
import percySnapshot from '@percy/playwright';
import { Page } from 'playwright';
import {
  createNotebook,
  getPadName,
  navigateToNotebook,
  navigateToNotebookWithClassicUrl,
  setUp,
  waitForEditorToLoad,
} from './page-utils/Pad';
import { withNewUser } from './utils';
import notebookSource from './__fixtures__/001-notebook';

describe('notebook load json', () => {
  let user: User;
  let sharedNotebookLink: string;
  let sharedNotebookPage: Page;
  let workspace: WorkspaceRecord;
  let notebook: Pad;

  beforeAll(async () => {
    const userCreationResult = await setUp({
      createAndNavigateToNewPad: false,
    });
    user = userCreationResult.user;
    [workspace] = userCreationResult.workspaces;
  });

  beforeAll(async () => {
    notebook = await createNotebook({
      doc: notebookSource.children,
      user,
      workspace,
    });
  });

  it('navigates to notebook and loads it', async () => {
    await navigateToNotebook(notebook.id);
    // some time for the notebook to render
    await page.waitForTimeout(1000);
    await waitForEditorToLoad();
    expect(await getPadName()).toBe('Everything, everywhere, all at once');

    expect(
      await page.$(
        'text=You can change the participation and multiplier above, and it will be reflected in the calculation below'
      )
    ).toBeDefined();

    await percySnapshot(page, 'Notebook: All elements');

    expect(await page.$('text=756,869,701')).toBeDefined();
  });

  it('old-style URLs work and pass on search params', async () => {
    await navigateToNotebookWithClassicUrl(notebook.id, '?searchParam=foo');
    // some time for the notebook to render
    await page.waitForTimeout(1000);
    await waitForEditorToLoad();
    expect(await getPadName()).toBe('Everything, everywhere, all at once');
    expect(new URL(page.url()).searchParams.get('searchParam')).toEqual('foo');
  });

  it('navigates to shared notebook link', async () => {
    const linkSelector = 'text=//n/Everything-everywhere-all-at-once/';
    await page.click('text=share');
    await page.click('[aria-checked="false"]');

    await page.waitForSelector(linkSelector);

    sharedNotebookLink = await page.innerText(linkSelector);
    expect(sharedNotebookLink.length).toBeGreaterThan(0);
    const newContext = await browser.newContext();
    sharedNotebookPage = await newContext.newPage();

    await withNewUser(newContext);

    await sharedNotebookPage.goto(sharedNotebookLink);
    await waitForEditorToLoad(sharedNotebookPage);
    await percySnapshot(page, 'Notebook: Shared with a user');
    // make sure screenshot is captured
    await expect(page).toBeDefined();
  });

  it('navigates to shared notebook link incognito', async () => {
    const newContext = await browser.newContext();
    sharedNotebookPage = await newContext.newPage();

    await sharedNotebookPage.goto(sharedNotebookLink);
    await waitForEditorToLoad(sharedNotebookPage);
    await percySnapshot(page, 'Notebook: Published mode (incognito)');
    // make sure screenshot is captured
    await expect(page).toBeDefined();
  });
});
