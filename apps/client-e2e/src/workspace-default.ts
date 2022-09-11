import { initialWorkspace } from '@decipad/initial-workspace';
import percySnapshot from '@percy/playwright';
import { Page } from 'playwright-core';
import waitForExpect from 'wait-for-expect';
import { getPadList, setUp } from './page-utils/Workspace';

const byName = (a: { name: string }, b: { name: string }): number => {
  return a.name.localeCompare(b.name);
};

describe('workspace default', () => {
  beforeEach(setUp);

  test('should display the initial notebooks', async () => {
    await waitForExpect(async () => {
      const pads = await (await getPadList()).sort(byName);
      expect(pads).toMatchObject(
        initialWorkspace.notebooks
          .map((notebook) => ({
            name: notebook.title,
          }))
          .sort(byName)
      );
    });
    await percySnapshot(page as Page, 'Dashboard: Initial Notebooks');
  });
});
