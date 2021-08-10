import { getPadList, setUp } from './page-utils/Workspace';

describe('Default workspace', () => {
  beforeEach(async () => {
    await setUp();
  });

  test('should display one initial notebook', async () => {
    const pads = await getPadList();
    expect(pads).toHaveLength(1);
    expect(pads[0].name).toMatchInlineSnapshot(`"My first pad"`);
  });
});
