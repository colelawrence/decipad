import waitForExpect from 'wait-for-expect';
import {
  clickNewPadButton,
  duplicatePad,
  getPadList,
  navigateToWorkspacePage,
  removePad,
  setUp,
} from './page-utils/Workspace';

describe('Workspace', () => {
  beforeAll(async () => {
    await setUp();
  });

  beforeEach(async () => {
    // make sure we are in the workspace page
    await navigateToWorkspacePage();
  });

  test('creates a new pad and navigates to pad detail', async () => {
    await clickNewPadButton();
    await expect(
      page.waitForNavigation({ url: '/workspaces/*/pads/*' })
    ).resolves.not.toThrow();
    await page.goBack();
  });

  test('can list pads', async () => {
    const pads = await getPadList();
    expect(pads).toHaveLength(2);
  });

  test('can remove pad', async () => {
    await removePad(1);
    await waitForExpect(async () => {
      const pads = await getPadList();
      expect(pads).toHaveLength(1);
    });
  });

  test('can duplicate pad', async () => {
    await duplicatePad(0);
    await waitForExpect(async () => {
      const pads = await getPadList();
      expect(pads).toHaveLength(2);
    });
    const pads = await getPadList();
    const copyIndex = pads.findIndex((pad) => pad.name?.startsWith('Copy of'));
    expect(copyIndex).toBeGreaterThanOrEqual(0);
    const originalIndex = (copyIndex + 1) % pads.length;
    expect(pads[copyIndex].name).toBe(`Copy of ${pads[originalIndex].name}`);
  });

  test('can navigate to pad detail', async () => {
    const pads = await getPadList();
    expect(pads.length).toBeGreaterThanOrEqual(0);
    const pad = pads[0];
    await pad.anchor.click();
    expect(page.url()).toMatch(/\/workspaces\/[^/]+\/pads\/[^/]+/);
    await page.goBack();
  });
});
