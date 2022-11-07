import {
  focusOnBody,
  setUp,
  waitForEditorToLoad,
  waitForSaveFlush,
} from './page-utils/Pad';

describe('notebook reload', () => {
  beforeAll(setUp);
  beforeAll(waitForEditorToLoad);

  it('type lots of stuff', async () => {
    await focusOnBody();
    await page.keyboard.type('this is the first paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the second paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the third paragraph');

    // an empty paragraph is now created under non-empty paragraphs.
    expect(await page.$$('[data-slate-editor] p')).toHaveLength(4);
    await waitForSaveFlush();
  });

  it('stuff is there after reload', async () => {
    await page.reload();
    await waitForEditorToLoad();
    const lastParagraph = await page.waitForSelector(
      '[data-slate-editor] p >> nth=-2'
    );
    expect(await lastParagraph.textContent()).toBe(
      'this is the third paragraph'
    );
  });
});
