import {
  createCalculationBlockBelow,
  getCodeLineContent,
  getResult,
} from './page-utils/Block';
import {
  focusOnBody,
  keyPress,
  setUp,
  waitForEditorToLoad,
} from './page-utils/Pad';
import { getCaretPosition } from './utils';

describe('notebook calculation block', () => {
  beforeAll(() => setUp());
  beforeAll(() => waitForEditorToLoad());

  let lineNo = -1;

  it('starts empty', async () => {
    expect((await page.textContent('[contenteditable] h1'))!.trim()).toBe('');
    expect((await page.textContent('[contenteditable] p'))!.trim()).toBe('');
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('can create a table using a calculation block', async () => {
    const lineText = 'A = { B = [1,2,3] }';
    await focusOnBody();
    await createCalculationBlockBelow('A = { B = [1,2,3] }');

    lineNo += 1;
    const line = await getCodeLineContent(lineNo);
    expect(line).toBe(lineText);

    const result = await getResult(lineNo);
    const rows = result.locator('table tr');
    expect(await rows.count()).toBe(4);

    const headerCellContents = await rows.locator('th').allTextContents();
    const bodyRowsContents = await rows.locator('td').allTextContents();
    expect(headerCellContents).toEqual(['B']);
    expect(bodyRowsContents).toEqual(['1', '2', '3']);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Get the column `A.B` from the table', async () => {
    const lineText = 'A.B';
    await keyPress('ArrowDown');
    await createCalculationBlockBelow(lineText);

    lineNo += 1;
    const line = await getCodeLineContent(lineNo);
    expect(line).toBe(lineText);

    const result = await getResult(lineNo);
    const rows = result.locator('table tr');
    expect(await rows.count()).toBe(3);

    const cellContents = await rows
      .locator('td:first-of-type')
      .allTextContents();
    expect(cellContents).toEqual(['1', '2', '3']);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Get an error from getting column that doesnt exist `A.C`', async () => {
    const lineText = 'A.C';
    await keyPress('ArrowDown');
    await createCalculationBlockBelow(lineText);

    lineNo += 1;

    const line = await getCodeLineContent(lineNo);
    expect(line).toBe(lineText);

    const result = await getResult(lineNo);
    expect(await result.allTextContents()).toMatchObject([
      expect.stringMatching(/warning/i),
    ]);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Can show a numerical result inline`', async () => {
    const lineText = 'total(A.B) miles * hour';
    await keyPress('ArrowDown');
    await createCalculationBlockBelow(lineText);

    lineNo += 1;

    const line = await getCodeLineContent(lineNo);
    expect(line).toBe(lineText);

    const result = await getResult(lineNo);
    expect(await result.allTextContents()).toMatchObject([
      expect.stringMatching(/6.+miles.+hour/i),
    ]);
  });

  it('Calculates 1 + 1', async () => {
    const lineText = '1 + 1';
    await keyPress('ArrowDown');
    await createCalculationBlockBelow(lineText);

    lineNo += 1;

    const line = await getCodeLineContent(lineNo);
    expect(line).toBe(lineText);

    const result = await getResult(lineNo);
    expect(await result.allTextContents()).toMatchObject([
      expect.stringMatching(/2/i),
    ]);
  });

  it('Enter does a soft break inside parentesis', async () => {
    const lineText = '(10 + 2)';
    await keyPress('ArrowDown');
    await createCalculationBlockBelow(lineText);

    lineNo += 1;

    const lineBefore = await getCodeLineContent(lineNo);
    expect(lineBefore).toBe(lineText);

    await keyPress('ArrowLeft');
    await keyPress('ArrowLeft');
    await keyPress('Enter');

    const [left, right] = [lineText.slice(0, -2), lineText.slice(-2)];
    const brokenLine = `${left}\n${right}`;
    const lineAfter = await getCodeLineContent(lineNo);
    expect(lineAfter).toBe(brokenLine);
  });

  it('Enter moves caret to the end', async () => {
    const lineText = '3 + 7';
    await keyPress('ArrowDown');
    await createCalculationBlockBelow(lineText);

    lineNo += 1;

    await keyPress('ArrowLeft');
    await keyPress('ArrowLeft');
    const caretBefore = await getCaretPosition();

    await keyPress('Enter');

    const caretAfter = await getCaretPosition();
    expect(caretBefore).toBeDefined();
    expect(caretAfter).toBe(caretBefore! + 2);
  });
});
