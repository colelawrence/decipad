import {
  focusOnBody,
  getPadContent,
  setUp,
  waitForEditorToLoad,
  keyPress,
  createCalculationBlock,
  emptyPad,
} from './page-utils/Pad';

describe('pad content', () => {
  beforeAll(setUp);

  beforeEach(waitForEditorToLoad);

  // TODO: uncomment this if we get some flakyness in these tests,
  // specifically if we get detached errors.
  // beforeEach(async () => await page.waitForTimeout(250));
  it('starts with an empty title and an empty body', async () => {
    expect(await getPadContent()).toMatchObject(emptyPad);
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

  it('can create a table using a calculation block', async () => {
    await keyPress('ArrowDown');
    await createCalculationBlock('A = { B = [1,2,3');

    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the' },
      { type: 'p', text: 'second para-graph' },
      { type: 'p', text: 'this is the content for the third paragraph' },
      { type: 'pre', text: 'A = { B = [1,2,3]}\nTable' },
      { type: 'div', text: 'A = { B = [1,2,3]}' },
      { type: 'p', text: '' },
    ]);
  });

  it('Get `A.B` from the table', async () => {
    await createCalculationBlock('A.B');

    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the' },
      { type: 'p', text: 'second para-graph' },
      { type: 'p', text: 'this is the content for the third paragraph' },
      { type: 'pre', text: 'A = { B = [1,2,3]}\nTable' },
      { type: 'div', text: 'A = { B = [1,2,3]}' },
      { type: 'p', text: '' },
      { type: 'pre', text: 'A.B\n1, 2, 3' },
      { type: 'div', text: 'A.B' },
      { type: 'p', text: '' },
    ]);
  });

  it('Get an error from getting column that doesnt exist `A.C`', async () => {
    await createCalculationBlock('A.C');
    // errors from language are async
    await page.waitForTimeout(500);
    await page.pause();

    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: 'this is the content for the first paragraph' },
      { type: 'p', text: 'this is the content for the' },
      { type: 'p', text: 'second para-graph' },
      { type: 'p', text: 'this is the content for the third paragraph' },
      { type: 'pre', text: 'A = { B = [1,2,3]}\nTable' },
      { type: 'div', text: 'A = { B = [1,2,3]}' },
      { type: 'p', text: '' },
      { type: 'pre', text: 'A.B\n1, 2, 3' },
      { type: 'div', text: 'A.B' },
      { type: 'p', text: '' },
      { type: 'pre', text: 'A.C' },
      { type: 'div', text: 'A.C' },
      { type: 'p', text: '' },
    ]);
  });
});
