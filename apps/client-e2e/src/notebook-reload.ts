import {
  focusOnBody,
  setUp,
  waitForEditorToLoad,
  waitForSaveFlush,
} from './page-utils/Pad';

describe('notebook reload', () => {
  beforeAll(() => setUp());

  beforeAll(() => waitForEditorToLoad());

  it('type lots of stuff', async () => {
    await focusOnBody();
    await page.keyboard.type('this is the first paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the second paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the third paragraph');
    expect(await page.$$('[contenteditable] p')).toHaveLength(3);
    await waitForSaveFlush();
  });

  it('stuff is there after reload', async () => {
    await page.reload();
    await waitForEditorToLoad();
    const lastParagraph = await page.waitForSelector(
      '[contenteditable] p >> nth=-1'
    );
    expect(await lastParagraph.textContent()).toBe(
      'this is the third paragraph'
    );
  });
});
