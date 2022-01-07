import {
  focusOnBody,
  getPadContent,
  waitForEditorToLoad,
  createTable,
  createCalculationBlock,
  keyPress,
  writeInTable,
  goToPlayground,
  focusOnLastParagraph,
} from './page-utils/Pad';

describe('pad calculation blocks', () => {
  beforeAll(goToPlayground);
  beforeEach(waitForEditorToLoad);

  it('starts with an empty title and an empty body', async () => {
    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: '' },
    ]);
  });

  it('creates a table', async () => {
    await focusOnBody();
    await createTable();

    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: '' },
      { type: 'div', text: 'Add row' },
      { type: 'p', text: '' },
    ]);
  });

  it('can name a table using [tab]s', async () => {
    await page.click('[placeholder="TableName"]');
    await page.keyboard.type('City');
    await keyPress('Enter');
    const tableTitle = await page.getAttribute(
      'input[placeholder="TableName"]',
      'value'
    );
    expect(tableTitle).toBe('City');
  });

  it('can fill a table', async () => {
    await writeInTable('Name');
    await writeInTable('Bordeaux');
    await writeInTable('Nice');
    await writeInTable('Marseille');
    await keyPress('Enter');

    const row1 = await page.getAttribute(':nth-match(input, 3)', 'value');
    const row2 = await page.getAttribute(':nth-match(input, 4)', 'value');
    const row3 = await page.getAttribute(':nth-match(input, 5)', 'value');

    expect(row1).toBe('Bordeaux');
    expect(row2).toBe('Nice');
    expect(row3).toBe('Marseille');
  });

  it('Adds `Distances` table', async () => {
    await focusOnLastParagraph();

    await createCalculationBlock(
      'Distances = { ...City, Distance = [585 km, 933 km, 775 km'
    );

    expect(await getPadContent()).toMatchObject([
      { type: 'h1', text: '' },
      { type: 'p', text: '' },
      { type: 'div', text: 'Add row' },
      { type: 'p', text: '' },
      {
        type: 'pre',
        text: 'Distances = { ...City, Distance = [585 km, 933 km, 775 km]}',
      },
      {
        type: 'div',
        text: 'Distances = { ...City, Distance = [585 km, 933 km, 775 km]}',
      },
      { type: 'p', text: '' },
    ]);
  });
});
