import {
  focusOnBody,
  setUp,
  waitForEditorToLoad,
  keyPress,
} from './page-utils/Pad';
import {
  createCalculationBlock,
  getCalculationBlocks,
} from './page-utils/CalculationBlock';

describe('pad content', () => {
  beforeAll(() => setUp());
  beforeAll(waitForEditorToLoad);

  it('starts empty', async () => {
    expect((await page.textContent('[contenteditable] h1'))!.trim()).toBe('');
    expect((await page.textContent('[contenteditable] p'))!.trim()).toBe('');
  });

  it('can create a table using a calculation block', async () => {
    await focusOnBody();
    await keyPress('Enter');
    await createCalculationBlock('A = { B = [1,2,3] }');

    const blocks = await getCalculationBlocks();
    expect(blocks).toMatchObject([
      {
        lines: [
          {
            code: 'A = { B = [1,2,3] }',
          },
        ],
      },
    ]);

    const [{ result }] = blocks;
    const rows = await result!.$$('table tr');
    expect(rows).toHaveLength(4);

    const [headerRow, ...bodyRows] = rows;
    const headerCell = await headerRow.$('th');
    expect(await headerCell!.innerText()).toBe('B');

    const rowTexts = await Promise.all(
      bodyRows.map(async (bodyRow) => {
        const cell = await bodyRow.$('td');
        return cell!.innerText();
      })
    );
    expect(rowTexts).toEqual(['1', '2', '3']);
  });

  it('Get the column `A.B` from the table', async () => {
    await keyPress('ArrowDown');
    await keyPress('Enter');
    await createCalculationBlock('A.B');

    const blocks = await getCalculationBlocks();
    expect(blocks).toMatchObject([
      expect.any(Object),
      {
        lines: [
          {
            code: 'A.B',
          },
        ],
      },
    ]);
    const [, { result }] = blocks;
    const rows = await result!.$$('tr');
    expect(rows).toHaveLength(3);

    const rowTexts = await Promise.all(
      rows.map(async (bodyRow) => {
        const cell = await bodyRow.$('td:first-of-type');
        return cell!.innerText();
      })
    );
    expect(rowTexts).toEqual(['1', '2', '3']);
  });

  it('Get an error from getting column that doesnt exist `A.C`', async () => {
    await keyPress('ArrowDown');
    await keyPress('Enter');
    await createCalculationBlock('A.C');

    const blocks = await getCalculationBlocks();
    expect(blocks).toMatchObject([
      expect.any(Object),
      expect.any(Object),
      {
        lines: [
          {
            code: 'A.C',
          },
        ],
        result: null,
      },
    ]);
  });
});
