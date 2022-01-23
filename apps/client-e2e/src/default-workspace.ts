import waitForExpect from 'wait-for-expect';
import { initialWorkspace } from '@decipad/initial-workspace';
import { getPadList, setUp } from './page-utils/Workspace';

describe('Default workspace', () => {
  beforeEach(setUp);

  test('should display the initial notebooks', async () => {
    await waitForExpect(async () => {
      const pads = await getPadList();
      expect(pads).toMatchObject(
        initialWorkspace.notebooks.map((notebook) => ({
          name: notebook.title,
        }))
      );
    });
  });
});
