import { Pad, User, WorkspaceRecord } from '@decipad/backendtypes';
import {
  setUp,
  navigateToNotebook,
  waitForEditorToLoad,
  createPadFromUpdates,
  getPadName,
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
    await navigateToNotebook(workspace.id, notebook.id);
    await waitForEditorToLoad();
    expect(await getPadName()).toBe(
      'Negotiating your VC first priced round as a founder'
    );

    const textNode = await page.$(
      'text=You can change the participation and multiplier above, and it will be reflected in the calculation below'
    );
    expect(textNode).not.toBeNull();

    await page.pause();

    const cellNode = await page.$('text=1,024,000,000');
    expect(cellNode).not.toBeNull();
  });
});
