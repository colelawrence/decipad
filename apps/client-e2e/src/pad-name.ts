import {
  getPadName,
  setUp,
  waitForEditorToLoad,
  waitForSaveFlush,
} from './page-utils/Pad';

describe('Pad name', () => {
  beforeAll(async () => {
    await setUp();
  });

  test('starts empty', async () => {
    expect(await getPadName()).toBe('');
  });

  test('can be typed', async () => {
    await page.keyboard.type('hello world!');
    await page.keyboard.press('Enter');
    await waitForSaveFlush();
    expect(await getPadName()).toBe('hello world!');
  });

  test('got saved', async () => {
    await page.reload();
    await waitForEditorToLoad();
    expect(await getPadName()).toBe('hello world!');
  });

  test('can be changed', async () => {
    await page.reload();
    await waitForEditorToLoad();
    const padName = await getPadName();
    expect(padName).toBe('hello world!');
    for (let i = 0; i < padName.length; i += 1) {
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await page.keyboard.type(' again!');
    await page.keyboard.press('Enter');
    await waitForSaveFlush();
    expect(await getPadName()).toBe('hello world again!');
  });

  test('can get renamed', async () => {
    await page.reload();
    await waitForEditorToLoad();
    expect(await getPadName()).toBe('hello world again!');
  });
});
