import waitForExpect from 'wait-for-expect';
import { createTable, writeInTable } from './page-utils/Block';
import {
  focusOnBody,
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from './page-utils/Pad';

describe('notebook table', () => {
  beforeAll(goToPlayground);
  beforeAll(() => waitForEditorToLoad());

  it('creates a table', async () => {
    expect(await page.$('[contenteditable] table')).toBe(null);

    await focusOnBody();
    await page.keyboard.insertText('This is some text.');
    await keyPress('Enter');
    await createTable();

    expect(await page.waitForSelector('[contenteditable] table')).not.toBe(
      null
    );
  });

  it('can fill a table', async () => {
    await writeInTable('X', 0);
    await writeInTable('1', 1);
    await writeInTable('2', 2);
    await writeInTable('3', 3);

    const row1 = await page
      .locator('table > tbody > tr:nth-child(1) > td:nth-child(2)')
      .textContent();
    const row2 = await page
      .locator('table > tbody > tr:nth-child(2) > td:nth-child(2)')
      .textContent();
    const row3 = await page
      .locator('table > tbody > tr:nth-child(3) > td:nth-child(2)')
      .textContent();

    expect(row1).toBe('1');
    expect(row2).toBe('2');
    expect(row3).toBe('3');
  });

  it('can delete a row', async () => {
    await page
      .locator(
        'table > tbody > tr:nth-child(3) > th > div > button:nth-child(2)'
      )
      .click();

    await page.locator('span', { hasText: 'Delete' }).click();

    const row1 = await page
      .locator('table > tbody > tr:nth-child(1) > td:nth-child(2)')
      .textContent();
    const row2 = await page
      .locator('table > tbody > tr:nth-child(2) > td:nth-child(2)')
      .textContent();

    expect(row1).toBe('1');
    expect(row2).toBe('2');
  });

  it('can add a new row', async () => {
    await page
      .locator('table > tfoot > tr > td > button')
      .click({ force: true });
    await page.waitForTimeout(2000);
    await page
      .locator('table > tbody > tr:nth-child(3) > td:nth-child(2)')
      .click();
    await writeInTable('7', 3, 0);

    const row3 = await page
      .locator('table > tbody > tr:nth-child(3) > td:nth-child(2)')
      .textContent();

    expect(row3).toBe('7');
  });

  it('can add a new column', async () => {
    await page.locator('div + table + button').click({ force: true });
    await writeInTable('Y', 0, 1);
    await writeInTable('2020-01-01', 1, 1);
    await writeInTable('2020-02-01', 2, 1);
    await writeInTable('2020-03-01', 3, 1);

    const row1 = await page
      .locator('table > tbody > tr:nth-child(1) > td:nth-child(3)')
      .textContent();
    const row2 = await page
      .locator('table > tbody > tr:nth-child(2) > td:nth-child(3)')
      .textContent();
    const row3 = await page
      .locator('table > tbody > tr:nth-child(3) > td:nth-child(3)')
      .textContent();

    expect(row1).toBe('2020-01-01');
    expect(row2).toBe('2020-02-01');
    expect(row3).toBe('2020-03-01');
  });

  it('can write spaces in a table cell', async () => {
    await page.waitForTimeout(2000);
    await page.locator('div + table + button').click({ force: true });
    await page.waitForTimeout(2000);
    await writeInTable('X', 0, 2);
    await writeInTable(
      'The rain  in   spain    falls     mainly in the plane!',
      1,
      2
    );
    await writeInTable('Hello world!', 2, 2);

    const row1 = await page
      .locator('table > tbody > tr:nth-child(1) > td:nth-child(4)')
      .textContent();
    const row2 = await page
      .locator('table > tbody > tr:nth-child(2) > td:nth-child(4)')
      .textContent();

    expect(row1).toBe('The rain  in   spain    falls     mainly in the plane!');
    expect(row2).toBe('Hello world!');
  });

  it('can change column type to a formula', async () => {
    await page.click('thead th:nth-child(5) button:has-text("Caret down")');
    await page.press('[role="menuitem"]:has-text("Change type")', 'Enter');
    await page.press('[role="menuitem"]:has-text("Formula")', 'Enter');

    const codeBlock = await page.waitForSelector('section:has-text("=")');
    const codeBlockText = await codeBlock.innerText();

    expect(codeBlockText).toContain('Property4 =');
  });

  it('focused on formula', async () => {
    await waitForExpect(async () => {
      const hasFocusOnSection = `
        document.hasFocus() &&
        document.getSelection()?.anchorNode?.parentElement?.closest?.('section') != null
      `;
      expect(await page.evaluate(hasFocusOnSection)).toBe(true);
    });
  });

  it('formula produced desired output', async () => {
    await page.keyboard.type('1 + 1');

    const codeBlock = await page.waitForSelector(
      'section:has-text("="):first-child'
    );
    const codeBlockText = await codeBlock.innerText();
    // splitting on new line removes the text from auto-complete menu
    expect(codeBlockText.split('\n')[0]).toBe('Property4 = 1 + 1');

    await waitForExpect(async () => {
      const cell = await page
        .locator('table > tbody > tr:nth-child(1) > td:nth-child(5)')
        .textContent();

      expect(cell?.trim()).toBe('2');
    });
  });

  it.todo('has more meaningful css selectors');
  it.todo('can change type to incompatible type');
  it.todo('cannot create a variable named `B`');
  it.todo('can apply the function `sum` to a thing typed as number');
  it.todo('can delete a column');
});
