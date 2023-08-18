import { expect, Page, test } from '@playwright/test';
import waitForExpect from 'wait-for-expect';
import {
  focusOnBody,
  goToPlayground,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import {
  addColumn,
  addRow,
  createTable,
  focusOnTable,
  focusOnTableColumnFormula,
  getFromTable,
  openColTypeMenu,
  openRowMenu,
  writeInTable,
} from '../utils/page/Table';
import { Timeouts } from '../utils/src';

test.describe('Adding tables with keyboard (and more)', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await goToPlayground(page);
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('creates a table', async () => {
    await expect(page.locator('[data-slate-editor] table')).toBeHidden();

    await focusOnBody(page);
    await page.keyboard.insertText('This is some text.');
    await page.keyboard.press('Enter');
    await createTable(page);
  });

  test('can fill a table', async () => {
    await writeInTable(page, '1', 1);
    await writeInTable(page, '2', 2);
    await writeInTable(page, '3', 3);
    expect(await getFromTable(page, 1)).toBe('1');
    expect(await getFromTable(page, 2)).toBe('2');
    expect(await getFromTable(page, 3)).toBe('3');
  });

  test('can delete a row', async () => {
    await openRowMenu(page, 3);
    await page.getByTestId('delete-row').click();
    expect(await getFromTable(page, 1)).toBe('1');
    expect(await getFromTable(page, 2)).toBe('2');
  });

  test('can add a new row', async () => {
    await focusOnTable(page);
    await addRow(page);
    await writeInTable(page, '7', 3);
    expect(await getFromTable(page, 3)).toBe('7');
  });

  test('can add a new column', async () => {
    await focusOnTable(page);
    await addColumn(page);
    await page.waitForSelector('text="Column4"');
  });

  test('can write spaces in a table cell', async () => {
    await writeInTable(
      page,
      'The rain  in   spain    falls     mainly in the plane!',
      1,
      1
    );
    expect(await getFromTable(page, 1, 1)).toBe(
      'The rain  in   spain    falls     mainly in the plane!'
    );
  });

  test('can change column type to a formula', async () => {
    await openColTypeMenu(page, 2);
    await page.getByText('Formula').nth(2).click();

    const codeBlock = await page.waitForSelector('section:has-text("=")');

    await codeBlock.waitForSelector('role=code >> text=FormulaColumn3');
  });

  test('formula produced desired output', async () => {
    await focusOnTableColumnFormula(page);
    await page.keyboard.type('1 + 1');

    // eslint-disable-next-line playwright/valid-expect
    await waitForExpect(async () => {
      const codeBlock = await page.waitForSelector(
        'section:has-text("Column3 =")'
      );
      const codeBlockText = await codeBlock.innerText();
      // splitting on new line removes the text from auto-complete menu
      expect(codeBlockText.split('\n')[0]).toBe('Column3 =  1 + 1');
    });

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
    expect((await getFromTable(page, 1, 2, true))?.trim()).toBe('2');
  });

  test('add some numbers', async () => {
    await openColTypeMenu(page, 3);

    await page.click('[role="menuitem"]:has-text("Number")');

    await writeInTable(page, '1', 1, 3);
    await writeInTable(page, '2', 2, 3);
    await writeInTable(page, '3', 3, 3);

    expect(await getFromTable(page, 1, 3)).toEqual('1');
    expect(await getFromTable(page, 2, 3)).toEqual('2');
    expect(await getFromTable(page, 3, 3)).toEqual('3');
  });

  test('can add a formula on those numbers', async () => {
    await addColumn(page);
    await openColTypeMenu(page, 4);

    await page.click('[role="menuitem"]:has-text("Formula")');
    const codeBlock = await page.waitForSelector(
      'section:has-text("Column5 =")'
    );
    // eslint-disable-next-line playwright/valid-expect
    await waitForExpect(async () => {
      await expect(await codeBlock.innerText()).toContain('Column5 =');
    });

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await focusOnTableColumnFormula(page, 'Column5 =');
    await page.keyboard.type('2 / Column4');
    // eslint-disable-next-line playwright/no-wait-for-timeout
  });

  test('get any value from the table, to make sure it has not crashed', async () => {
    await addRow(page);
    expect(await getFromTable(page, 1, 3)).toEqual('1');
  });
});
