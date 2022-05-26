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

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('notebook calculation block', () => {
  beforeAll(() => setUp());
  beforeAll(() => waitForEditorToLoad());

  let lineNo = -1;

  it('starts empty', async () => {
    expect((await page.textContent('[contenteditable] h1'))!.trim()).toBe('');
    expect((await page.textContent('[contenteditable] p'))!.trim()).toBe('');
  });

  it('can create a table using a calculation block', async () => {
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

  it('Get the column `A.B` from the table', async () => {
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

  it('Get an error from getting column that doesnt exist `A.C`', async () => {
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

  it('Can show a numerical result inline`', async () => {
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
});
