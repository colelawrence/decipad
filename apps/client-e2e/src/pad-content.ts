import {
  focusOnBody,
  getPadContent,
  setUp,
  waitForEditorToLoad,
  keyPress,
} from './page-utils/Pad';

describe('pad content', () => {
  beforeAll(setUp);

  beforeEach(waitForEditorToLoad);

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
    await keyPress('Enter');
    await page.keyboard.type('this is the content for the second paragraph');
    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the second paragraph' },
    ]);
  });

  it('allows to create even another new paragraph', async () => {
    await keyPress('Enter');
    await page.keyboard.type('this is the content for the third paragraph');
    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the second paragraph' },
      { type: 'p', text: 'this is the content for the third paragraph' },
    ]);
  });

  it('allows to go back to the previous paragraph and remove some text', async () => {
    await keyPress('ArrowUp');
    await keyPress('ArrowRight');
    await keyPress('ArrowRight');
    for (let i = 0; i < 9; i += 1) {
      await keyPress('Backspace');
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
    for (let i = 0; i < 17; i += 1) {
      await keyPress('ArrowLeft');
    }
    await keyPress('Enter');
    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the' },
      { type: 'p', text: 'second para-graph' },
      { type: 'p', text: 'this is the content for the third paragraph' },
    ]);
  });

  it('can create a table', async () => {
    await keyPress('ArrowDown');
    await keyPress('ArrowDown'); // Move cursor back to end of text
    await keyPress('Enter'); // And make a new line
    await page.keyboard.type('/calc');
    await keyPress('Tab');
    await keyPress('Enter');
    // don't need ]} because of auto-complete
    // this test will break when we remove that auto-complete
    await page.keyboard.type('A = { B = [1,2,3');
    await keyPress('ArrowDown');

    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the' },
      { type: 'p', text: 'second para-graph' },
      { type: 'p', text: 'this is the content for the third paragraph' },
      // code block
      // and inline visualisation
      { type: 'pre', text: 'A = { B = [1,2,3]}\nTable' },
      // result below
      { type: 'div', text: 'A = { B = [1,2,3]}' },
      // new paragraph
      { type: 'p', text: '' },
    ]);
  });

  it('Get `A.B` from the table', async () => {
    await page.keyboard.type('/calc');
    await keyPress('Tab');
    await keyPress('Enter');
    await page.keyboard.type('A.B');
    await keyPress('ArrowDown');

    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the' },
      { type: 'p', text: 'second para-graph' },
      { type: 'p', text: 'this is the content for the third paragraph' },
      // code block
      // and inline visualisation
      { type: 'pre', text: 'A = { B = [1,2,3]}\nTable' },
      // result below
      { type: 'div', text: 'A = { B = [1,2,3]}' },
      // new paragraph
      { type: 'pre', text: 'A.B\n1, 2, 3' },
      { type: 'div', text: 'A.B' },
      { type: 'p', text: '' },
    ]);
  });

  it('Get an error from getting column that doesnt exist `A.C`', async () => {
    await keyPress('ArrowDown');
    await page.keyboard.type('/calc');
    await keyPress('Tab');
    await keyPress('Enter');
    await page.keyboard.type('A.C');
    await keyPress('ArrowDown');
    // errors from language are async
    await page.waitForTimeout(500);

    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the' },
      { type: 'p', text: 'second para-graph' },
      { type: 'p', text: 'this is the content for the third paragraph' },
      { type: 'pre', text: 'A = { B = [1,2,3]}\nTable' },
      { type: 'div', text: 'A = { B = [1,2,3]}' },
      { type: 'pre', text: 'A.B\n1, 2, 3' },
      { type: 'div', text: 'A.B' },
      { type: 'pre', text: 'A.C' },
      { type: 'div', text: 'A.C' },
      { type: 'p', text: '' },
    ]);
  });
});
