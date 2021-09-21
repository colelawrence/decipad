import {
  getPadName,
  setUp,
  waitForEditorToLoad,
  waitForSaveFlush,
} from './page-utils/Pad';

describe('Pad name', () => {
  beforeAll(setUp);

  test('starts empty', async () => {
    expect(await getPadName()).toBe('');
  });

  test('can be typed', async () => {
    await page.keyboard.type('hello world');
    await page.keyboard.press('Enter');
    await waitForSaveFlush();
    expect(await getPadName()).toBe('hello world');
  });

  test('got saved', async () => {
    await page.reload();
    await waitForEditorToLoad();
    expect(await getPadName()).toBe('hello world');
  });
});
