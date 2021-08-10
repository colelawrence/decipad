import {
  focusOnBody,
  getPadContent,
  setUp,
  waitForEditorToLoad,
} from './page-utils/Pad';

describe('pad content', () => {
  beforeAll(async () => await setUp());

  beforeEach(async () => await waitForEditorToLoad());

  // TODO: uncomment this if we get some flakyness in these tests,
  // specifically if we get detached errors.
  // beforeEach(async () => await page.waitForTimeout(250));

  it('starts with an empty title and an empty body', async () => {
    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: '' },
    ]);
  });

  it('allows changing the first paragraph on the body', async () => {
    await focusOnBody();
    await page.keyboard.type('this is the content for the first paragraph');
    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
    ]);
  });

  it('allows to create a new paragraph', async () => {
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the content for the second paragraph');
    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the second paragraph' },
    ]);
  });

  it('allows to create even another new paragraph', async () => {
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the content for the third paragraph');
    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the second paragraph' },
      { type: 'p', text: 'this is the content for the third paragraph' },
    ]);
  });

  it('allows to go back to the previous paragraph and remove some text', async () => {
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(250);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(250);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(250);
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press('Backspace');
    }
    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the second' },
      { type: 'p', text: 'this is the content for the third paragraph' },
    ]);
  });

  it('allows appending some text to an existing paragraph', async () => {
    page.keyboard.type('para-graph');
    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the second para-graph' },
      { type: 'p', text: 'this is the content for the third paragraph' },
    ]);
  });

  it('can split a paragraph in two', async () => {
    for (let i = 0; i < 17; i++) {
      await page.keyboard.press('ArrowLeft');
    }
    await page.keyboard.press('Enter');
    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the' },
      { type: 'p', text: 'second para-graph' },
      { type: 'p', text: 'this is the content for the third paragraph' },
    ]);
  });
});
