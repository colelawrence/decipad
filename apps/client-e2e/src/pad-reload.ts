import {
  focusOnBody,
  setUp,
  waitForEditorToLoad,
  waitForSaveFlush,
} from './page-utils/Pad';

describe('pad content', () => {
  beforeAll(setUp);

  beforeEach(waitForEditorToLoad);

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
    expect(await page.$$('[contenteditable] p')).toHaveLength(3);
    const p3 = (await page.$$('[contenteditable] p'))[2];
    expect(await p3.textContent()).toBe('this is the third paragraph');
  });
});
