import {
  focusOnBody,
  getPadContent,
  waitForEditorToLoad,
  createTable,
  keyPress,
  writeInTable,
  goToPlayground,
} from './page-utils/Pad';

describe('pad table', () => {
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
    await page.keyboard.type('A');
    await keyPress('Enter');
    const tableTitle = await page.getAttribute(
      'input[placeholder="TableName"]',
      'value'
    );
    expect(tableTitle).toBe('A');
  });

  it('can rename a table', async () => {
    await page.click('[placeholder="TableName"]');
    await page.fill('[placeholder="TableName"]', 'B');
    await keyPress('Enter');
    const tableTitle = await page.getAttribute(
      'input[placeholder="TableName"]',
      'value'
    );
    expect(tableTitle).toBe('B');
  });

  it('can fill a table', async () => {
    await writeInTable('X');
    await writeInTable('1');
    await writeInTable('2');
    await writeInTable('3');
    await keyPress('Enter');

    const row1 = await page.getAttribute(':nth-match(input, 3)', 'value');
    const row2 = await page.getAttribute(':nth-match(input, 4)', 'value');
    const row3 = await page.getAttribute(':nth-match(input, 5)', 'value');

    expect(row1).toBe('1');
    expect(row2).toBe('2');
    expect(row3).toBe('3');
  });

  it('can delete a row', async () => {
    const delete3 = await page.$(':nth-match(button:has-text("Minus"), 3)');
    await delete3?.click();

    const row1 = await page.getAttribute(':nth-match(input, 3)', 'value');
    const row2 = await page.getAttribute(':nth-match(input, 4)', 'value');

    expect(row1).toBe('1');
    expect(row2).toBe('2');
  });

  it('can add a new row', async () => {
    await page.click('text=CreateAdd row');
    const third = await page.$(':nth-match(input, 5)');
    await third?.click();

    await keyPress('7');
    await keyPress('Enter');

    const row3 = await page.getAttribute(':nth-match(input, 5)', 'value');

    expect(row3).toBe('7');
  });

  it('can add a new column', async () => {
    await page.click('button:has-text("Create")');
    await page.click(':nth-match([placeholder="ColumnName"], 2)');
    await keyPress('Y');
    await writeInTable('2020-01-01', 2); // 2 columns, more `Tab`
    await writeInTable('2020-02-01', 2);
    await writeInTable('2020-03-01', 2);
    await keyPress('Enter');

    const inputs = await page.$$('tr input');

    expect(await inputs[2].getAttribute('value')).toBe('1');
    expect(await inputs[3].getAttribute('value')).toBe('2020-01-01');
    expect(await inputs[4].getAttribute('value')).toBe('2');
    expect(await inputs[5].getAttribute('value')).toBe('2020-02-01');
    expect(await inputs[6].getAttribute('value')).toBe('7');
    expect(await inputs[7].getAttribute('value')).toBe('2020-03-01');
    expect(await inputs[0].getAttribute('value')).toBe('X');
    expect(await inputs[1].getAttribute('value')).toBe('Y');
  });

  it.todo('has more meaningful css selectors');
  it.todo('can change type to incompatible type');
  it.todo('cannot create a variable named `B`');
  it.todo('can apply the function `sum` to a thing typed as number');
  it.todo('can delete a column');
});
