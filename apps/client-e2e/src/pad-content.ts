import {
  focusOnBody,
  setUp,
  waitForEditorToLoad,
  keyPress,
} from './page-utils/Pad';

describe('pad content', () => {
  beforeAll(() => setUp());
  beforeAll(() => waitForEditorToLoad());

  it('starts empty', async () => {
    expect((await page.textContent('[contenteditable] h1'))!.trim()).toBe('');
    expect((await page.textContent('[contenteditable] p'))!.trim()).toBe('');
  });

  it('allows changing the first paragraph on the body', async () => {
    await focusOnBody();
    await page.keyboard.type('this is the content for the first paragraph');
    expect(await page.textContent('[contenteditable] p')).toBe(
      'this is the content for the first paragraph'
    );
  });

  it('allows to create a new paragraph', async () => {
    await keyPress('Enter');
    expect(await page.$$('[contenteditable] p')).toHaveLength(2);
  });
  it('allows to type in the second paragraph', async () => {
    await page.keyboard.type('this is the content for the second paragraph');
    const [, p2] = await page.$$('[contenteditable] p');
    expect(await p2.textContent()).toBe(
      'this is the content for the second paragraph'
    );
  });

  it('allows to create even another new paragraph', async () => {
    await keyPress('Enter');
    expect(await page.$$('[contenteditable] p')).toHaveLength(3);
  });
  it('allows to type in the third paragraph', async () => {
    await page.keyboard.type('this is the content for the third paragraph');
    const [, , p3] = await page.$$('[contenteditable] p');
    expect(await p3.textContent()).toBe(
      'this is the content for the third paragraph'
    );
  });

  it('allows to go back to the previous paragraph and remove some text', async () => {
    const [, p2] = await page.$$('[contenteditable] p');

    // navigate to the element with flake redundancy
    await keyPress('ArrowUp');
    p2.focus();
    // navigate to the end with flake redundancy
    await keyPress('End');
    await keyPress('End');

    for (let i = 0; i < ' paragraph'.length; i += 1) {
      await keyPress('Backspace');
    }
    expect(await p2.textContent()).toBe('this is the content for the second');
  });

  it('allows appending some text to an existing paragraph', async () => {
    await page.keyboard.type(' para-graph');
    const [, p2] = await page.$$('[contenteditable] p');
    expect(await p2.textContent()).toBe(
      'this is the content for the second para-graph'
    );
  });

  it('can split a paragraph in two', async () => {
    for (let i = 0; i < 'second para-graph'.length; i += 1) {
      await keyPress('ArrowLeft');
    }
    await keyPress('Enter');
    expect(await page.$$('[contenteditable] p')).toHaveLength(4);

    const [, p2, p3] = await page.$$('[contenteditable] p');
    expect(await p2.textContent()).toBe('this is the content for the ');
    expect(await p3.textContent()).toBe('second para-graph');
  });
});
