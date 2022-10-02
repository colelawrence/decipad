import { initialWorkspace } from '@decipad/initial-workspace';
import waitForExpect from 'wait-for-expect';
import {
  clickNewPadButton,
  duplicatePad,
  getPadList,
  navigateToWorkspacePage,
  removePad,
  setUp,
} from './page-utils/Workspace';

describe('workspace modifications', () => {
  beforeAll(setUp);
  beforeEach(navigateToWorkspacePage);

  test('creates a new pad and navigates to pad detail', async () => {
    await clickNewPadButton();
    await expect(
      page.waitForNavigation({ url: '/n/*' })
    ).resolves.not.toThrow();
    await page.goBack();
  });

  test('can list pads', async () => {
    await waitForExpect(async () => {
      const pads = await getPadList();
      expect(pads).toHaveLength(initialWorkspace.notebooks.length + 1);
    });
  });

  test('can remove pad', async () => {
    const padIndex = (await getPadList()).findIndex(
      (pad) => pad.name !== 'My first pad'
    );
    expect(padIndex).toBeGreaterThanOrEqual(0);
    await removePad(padIndex);
    await waitForExpect(async () => {
      const pads = await getPadList();
      expect(pads).toHaveLength(initialWorkspace.notebooks.length);
    });
  });

  test('can duplicate pad', async () => {
    await duplicatePad(0);
    await waitForExpect(async () => {
      const pads = await getPadList();
      expect(pads).toHaveLength(initialWorkspace.notebooks.length + 1);
    });
    const pads = await getPadList();
    const copyIndex = pads.findIndex((pad) => pad.name?.startsWith('Copy of'));
    expect(copyIndex).toBeGreaterThanOrEqual(0);
  });

  test('can navigate to pad detail', async () => {
    const pads = await getPadList();
    expect(pads.length).toBeGreaterThan(0);
    const pad = pads[0];
    await pad.anchor.click();
    expect(page.url()).toMatch(/\/n\/[^/]+/);
    await page.goBack();
  });
});
