import { Pad, User, WorkspaceRecord } from '@decipad/backendtypes';
import {
  createPadFromUpdates,
  getPadName,
  navigateToNotebook,
  navigateToNotebookWithClassicUrl,
  setUp,
  waitForEditorToLoad,
} from './page-utils/Pad';
import docUpdateData from './__fixtures__/001-notebook-encoded-update.json';

describe('load notebook', () => {
  let user: User;
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
    notebook = await createPadFromUpdates([docUpdateData], user, workspace);
  });

  it('navigates to notebook and loads it', async () => {
    await navigateToNotebook(notebook.id);
    // some time for the notebook to render
    await page.waitForTimeout(1000);
    await waitForEditorToLoad();
    expect(await getPadName()).toBe(
      'Negotiating your VC first priced round as a founder'
    );

    expect(
      await page.$(
        'text=You can change the participation and multiplier above, and it will be reflected in the calculation below'
      )
    ).toBeDefined();

    expect(await page.$('text=756,869,701')).toBeDefined();
  });

  it('old-style URLs work and pass on search params', async () => {
    await navigateToNotebookWithClassicUrl(notebook.id, '?searchParam=foo');
    // some time for the notebook to render
    await page.waitForTimeout(1000);
    await waitForEditorToLoad();
    expect(await getPadName()).toBe(
      'Negotiating your VC first priced round as a founder'
    );
    expect(new URL(page.url()).searchParams.get('searchParam')).toEqual('foo');
  });
});
