import { timeout } from '@decipad/utils';
import { getPadName, setUp, waitForEditorToLoad } from './page-utils/Pad';

describe('notebook name', () => {
  beforeAll(setUp);

  test('starts empty', async () => {
    expect(await getPadName()).toBe('');
  });

  test('can be typed', async () => {
    await page.keyboard.type('hello world');
    await page.keyboard.press('Enter');
    expect(await getPadName()).toBe('hello world');
    // pause for some time to give a chance to sync
    await timeout(1000);
  });

  test('got saved, and html title page is there', async () => {
    await page.reload();
    await waitForEditorToLoad();
    expect(await getPadName()).toBe('hello world');
    expect(await page.title()).toContain('hello world');
  });
});
