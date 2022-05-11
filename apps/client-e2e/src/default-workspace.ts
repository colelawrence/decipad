import waitForExpect from 'wait-for-expect';
import { initialWorkspace } from '@decipad/initial-workspace';
import { getPadList, setUp } from './page-utils/Workspace';

const byName = (a: { name: string }, b: { name: string }): number => {
  return a.name.localeCompare(b.name);
};

describe('Default workspace', () => {
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
  });
});
