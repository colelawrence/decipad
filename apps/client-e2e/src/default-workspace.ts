import waitForExpect from 'wait-for-expect';
import { getPadList, setUp } from './page-utils/Workspace';

describe('Default workspace', () => {
  beforeEach(setUp);

  test('should display one initial notebook', async () => {
    await waitForExpect(async () => {
      const pads = await getPadList();
      expect(pads).toHaveLength(4);
      const pad = pads.find((p) => p.name.match('Getting Started'));
      expect(pad).toBeDefined();
    });
  });
});
