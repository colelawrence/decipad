import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  focusOnBody,
  setUp,
  ControlPlus,
  keyPress,
  navigateToNotebook,
  waitForEditorToLoad,
  editorTitleLocator,
} from '../utils/page/Editor';

import {
  addColLeft,
  addColRight,
  addColumn,
  addRow,
  clickCalculateFirstColumn,
  createTable,
  getFromTable,
  getTableOrPage,
  removeColumn,
  removeRow,
  renameColumn,
  updateDataType,
  writeInTable,
  focusOnTable,
  insertRowAbove,
  insertRowBelow,
  deleteTable,
  changeColumnYear,
  clickCell,
  tableCellLocator,
  changeColumnMonth,
  changeColumnDay,
} from '../utils/page/Table';

import notebookSource from '../__fixtures__/006-notebook-formula-tables.json';
import {
  snapshot,
  Timeouts,
  createWorkspace,
  importNotebook,
} from '../utils/src';

const getTableCellRenderCount = (page: Page) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page.evaluate(() => (window as any).tableCellRenderCount);

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const STOP_RENDERING_POLL_INTERVAL = 5000;
const STOP_RENDERING_MAX_POLL_COUNT = 6;

const waitUntilStopRendering = async (page: Page): Promise<number> => {
  let previousRenderCount = await getTableCellRenderCount(page);

  for (let i = 0; i < STOP_RENDERING_MAX_POLL_COUNT; i += 1) {
    await wait(STOP_RENDERING_POLL_INTERVAL);
    const renderCount = await getTableCellRenderCount(page);
    if (renderCount === previousRenderCount) return renderCount;
    previousRenderCount = renderCount;
  }

  throw new Error('Timeout exceeded while waiting for table to stop rendering');
};

test.describe('Count how many times table cells render', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('count initial renders', async () => {
    await focusOnBody(page);
    await createTable(page);

    const renderCount = await waitUntilStopRendering(page);

    /**
     * If this fails with a number less than what's currently expected, reduce
     * the expected count. Congratulations, you've made tables more efficient!
     */
    const cellCount = 9;
    const expectedPerCell = 3;
    expect(renderCount).toBe(cellCount * expectedPerCell);
  });

  test('count renders in response to a single keystroke', async () => {
    await writeInTable(page, 'a', 1, 1);
    const previousRenderCount = await waitUntilStopRendering(page);
    await writeInTable(page, 'b', 1, 1);
    const renderCount = await waitUntilStopRendering(page);

    expect(renderCount).toBeGreaterThan(0);

    /**
     * If this fails with a number less than what's currently expected, reduce
     * the expected count. Congratulations, you've made tables more efficient!
     */
    expect(renderCount - previousRenderCount).toBe(2);
  });
});

test.describe('Basic Table Interactions + Collisions', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('creates 2 tables and names them', async () => {
    await focusOnBody(page);
    await createTable(page);
    await page.getByTestId('table-name-input').getByText('Table').waitFor();
    await page.getByTestId('table-name-input').getByText('Table').dblclick();
    await page.keyboard.type('NewTableName');
    await expect(page.getByText('NewTableName')).toBeVisible();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay); // IMPORTANT
    await createTable(page);
    await page
      .getByTestId('table-name-input')
      .getByText('Table', { exact: true })
      .waitFor();
    await page
      .getByTestId('table-name-input')
      .getByText('Table', { exact: true })
      .dblclick();
    await page.keyboard.type('NewTableName2');
    await expect(page.getByText('NewTableName2')).toBeVisible();
  });

  test('fills first table', async () => {
    // first column
    await writeInTable(page, 'Imports', 1, 0, 'NewTableName');
    expect(await getFromTable(page, 1, 0, false, 'NewTableName')).toBe(
      'Imports'
    );
    await writeInTable(page, 'Hydro, wind and solar', 2, 0, 'NewTableName');
    await writeInTable(page, 'Bioenergy', 3, 0, 'NewTableName');

    // second column
    await writeInTable(page, '0.68%', 1, 1, 'NewTableName');
    expect(await getFromTable(page, 1, 1, false, 'NewTableName')).toBe('0.68%');
    await writeInTable(page, '3.02%', 2, 1, 'NewTableName');
    await writeInTable(page, '9.32%', 3, 1, 'NewTableName');
  });

  test('adds sum smart row to percentages', async () => {
    await clickCalculateFirstColumn(page, 'NewTableName');
    await page.getByText('Sum').click();
    // check the 13.02 result
    await expect(page.getByText('13.02%')).toBeVisible();
  });

  test('fills second table', async () => {
    await writeInTable(page, 'Imports', 1, 0, 'NewTableName2');
  });

  test('adds 2 columns to first table', async () => {
    await addColumn(page, 'NewTableName');
    await addColumn(page, 'NewTableName');
  });

  test('adds 2 columns to second table', async () => {
    await addColumn(page, 'NewTableName2');
    await addColumn(page, 'NewTableName2');
  });

  test('adds col to the right', async () => {
    await addColRight(page, 2, 'NewTableName2');
    const table = getTableOrPage(page, 'NewTableName2');
    const headersCount = await table.getByTestId('table-header').count();

    expect(headersCount).toBe(6);
  });

  test('adds col to the left', async () => {
    await addColLeft(page, 2, 'NewTableName2');
    const table = getTableOrPage(page, 'NewTableName2');
    const headersCount = await table.getByTestId('table-header').count();

    expect(headersCount).toBe(7);
  });

  test('remove 2 columns from first table', async () => {
    await removeColumn(page, 3, 'NewTableName');
    await removeColumn(page, 2, 'NewTableName');
  });

  test('remove 2 columns from second table', async () => {
    await removeColumn(page, 3, 'NewTableName2');
    await removeColumn(page, 2, 'NewTableName2');
  });

  test('adds 2 rows to first table', async () => {
    await addRow(page, 'NewTableName');
    await addRow(page, 'NewTableName');
  });

  test('adds 2 rows to second table', async () => {
    await addRow(page, 'NewTableName2');
    await addRow(page, 'NewTableName2');
  });

  test('remove 2 rows to first table', async () => {
    await removeRow(page, 4, 'NewTableName');
    await removeRow(page, 4, 'NewTableName');
  });

  test('remove 2 rows to second table', async () => {
    await removeRow(page, 4, 'NewTableName2');
    await removeRow(page, 4, 'NewTableName2');
  });

  test('rename 2 columns to first table', async () => {
    await renameColumn(page, 1, 'NewColumName2', 'NewTableName');
    await renameColumn(page, 2, 'NewColumnName3', 'NewTableName');
  });

  test('rename 2 columns to second table', async () => {
    await renameColumn(page, 1, 'NewColumName2', 'NewTableName2');
    await renameColumn(page, 2, 'NewColumnName3', 'NewTableName2');
  });

  test('update 2 columns  data types from first table', async () => {
    await updateDataType(page, 1, 'NewTableName');
    await updateDataType(page, 2, 'NewTableName');
  });

  test('update 2 columns  data types from second table', async () => {
    await updateDataType(page, 1, 'NewTableName2');
    await updateDataType(page, 2, 'NewTableName2');
  });

  test('copy and paste', async () => {
    await page.getByTestId('paragraph-wrapper').nth(-1).click();
    await page.keyboard.insertText('test copy and paste text');
    await ControlPlus(page, 'A');
    await ControlPlus(page, 'C');
    await writeInTable(page, '', 2, 0, 'NewTableName2');
    await ControlPlus(page, 'V');
    await keyPress(page, 'ArrowRight');
    await ControlPlus(page, 'V');
  });
});

test.describe('Basic Table', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('creates table', async () => {
    await focusOnBody(page);
    await createTable(page);
  });

  test('deletes table and created a new table to check for name collisions', async () => {
    await deleteTable(page);
    await createTable(page);
    await expect(
      await page.getByTestId('code-line-warning').count(),
      `calculation errors`
    ).toBe(0);
  });

  test('fills table', async () => {
    // first column
    await writeInTable(page, 'Imports', 1, 0);
    expect(await getFromTable(page, 1, 0)).toBe('Imports');
    await writeInTable(page, 'Hydro, wind and solar', 2, 0);
    expect(await getFromTable(page, 2, 0)).toBe('Hydro, wind and solar');
    await writeInTable(page, 'Bioenergy', 3, 0);
    expect(await getFromTable(page, 3, 0)).toBe('Bioenergy');

    // second column
    await writeInTable(page, '0.68%', 1, 1);
    expect(await getFromTable(page, 1, 1)).toBe('0.68%');
    await writeInTable(page, '3.02%', 2, 1);
    expect(await getFromTable(page, 2, 1)).toBe('3.02%');
    await writeInTable(page, '9.32%', 3, 1);
    expect(await getFromTable(page, 3, 1)).toBe('9.32%');
  });

  test('updates table name', async () => {
    await page.getByTestId('table-name-input').dblclick();
    await page.keyboard.type('NewTableName');
    await expect(page.getByText('NewTableName')).toBeVisible();
  });

  test('can insert a new row below', async () => {
    await focusOnTable(page);
    await insertRowBelow(page, 3);
    await writeInTable(page, '1%', 4, 1);
    expect(await getFromTable(page, 4, 1)).toBe('1%');
  });

  test('can insert a new row above', async () => {
    await focusOnTable(page);
    await insertRowAbove(page, 4);
    // row 4 with 1% is now row 5
    expect(await getFromTable(page, 5, 1)).toBe('1%');
  });
});

test.describe('tests table date pickers', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  let col;
  let line;
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('checks table year picker', async () => {
    await focusOnBody(page);
    await createTable(page);
    line = 1;
    col = 1;
    await changeColumnYear(page, col);
    await clickCell(page, line, col);

    await page.getByText('Today').isVisible();
    await snapshot(page as Page, 'Tables: Year Picker');
    await page.getByText('Today').click();
    await expect(page.locator(tableCellLocator(col, line))).toContainText(
      `${year}`
    );
  });

  test('checks table month picker', async () => {
    line = 1;
    col = 2;
    await changeColumnMonth(page, col);
    await clickCell(page, line, col);

    await page.getByText('Today').isVisible();
    await snapshot(page as Page, 'Tables: Month Picker');
    await page.getByText('Today').click();

    await expect(page.locator(tableCellLocator(line, col))).toContainText(
      `${year}-${month}`
    );
  });

  test('checks table day picker', async () => {
    line = 1;
    col = 3;
    await addColumn(page);
    await changeColumnDay(page, col);
    await clickCell(page, line, col);

    // skipping snapshot since the modal is the same as the date widget
    await page.getByText('Today').click();

    await expect(page.locator(tableCellLocator(line, col))).toContainText(
      `${year}-${month}-${day}`
    );
  });
});

test.describe('Number Parcing Checks', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  let url: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('setup new notebook', async () => {
    await focusOnBody(page);
  });

  // can't make copy and paste work on our tests
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip('copy google sheet table', async () => {
    url = page.url();
    await page.goto(
      'https://docs.google.com/spreadsheets/d/1CimD6WcVrqqyqI7u7LqOmDIbfDYdh6SIhyUdLfnPQM0/edit#gid=0'
    );
    await page.locator('#waffle-rich-text-editor').press('ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowRight');
    page.locator('#waffle-rich-text-editor');
    await ControlPlus(page, 'C');
    await page.goto(url);
    await focusOnBody(page);
    await page.getByTestId('paragraph-content').click();
    await ControlPlus(page, 'V');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
  });

  test('create table', async () => {
    await createTable(page);
    await writeInTable(page, 'Thousand', 1, 0);
    expect(await getFromTable(page, 1, 0)).toBe('Thousand');
    await writeInTable(page, '$1,000.00', 1, 1);
    expect(await getFromTable(page, 1, 1)).toBe('$1,000.00');
    await writeInTable(page, 'Million', 2, 0);
    expect(await getFromTable(page, 2, 0)).toBe('Million');
    await writeInTable(page, '$1,000,000.00', 2, 1);
    expect(await getFromTable(page, 2, 1)).toBe('$1,000,000.00');
    await writeInTable(page, 'Billion', 3, 0);
    expect(await getFromTable(page, 3, 0)).toBe('Billion');
    await writeInTable(page, '$1,000,000,000.00', 3, 1);
    expect(await getFromTable(page, 3, 1)).toBe('$1,000,000,000.00');
  });

  test('update data type to number', async () => {
    await page
      .getByRole('cell', { name: 'Column2' })
      .getByTestId('table-column-menu-button')
      .click();
    await page.getByRole('menuitem', { name: 'Number' }).click();
    await focusOnBody(page);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    await page.getByText('$1,000,000,000.00').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    await expect(
      page.getByText('Cannot parse number out of "$1,000,000,000.00"')
    ).toContainText('Cannot parse number out of "$1,000,000,000.00');
  });
});

export const typeTest = (currentPage: Page, input: string) =>
  test.step('Trying to add text to formulas', async () => {
    await currentPage.getByTestId('code-line').fill(input);
  });

test.describe('Testing tables created from formulas', () => {
  test.describe.configure({ mode: 'serial' });

  let notebookId: string;
  let workspaceId: string;
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    workspaceId = await createWorkspace(page);
    notebookId = await importNotebook(
      workspaceId,
      Buffer.from(JSON.stringify(notebookSource), 'utf-8').toString('base64'),
      page
    );
    await navigateToNotebook(page, notebookId);
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Filling in the code and testing that the numbers are displayed properly', async () => {
    // This test will fail if topological sort is not working properly
    // Failing behavior:
    // +------+--------+
    // | Name | Values |
    // +------+--------+
    // | A    | 1      |
    // +------+--------+
    // | B    | 2      |
    // +------+--------+
    // | C    | 3      |
    // +------+--------+
    // | D    | 1      |
    // +------+--------+

    await page.getByTestId('code-line').click();
    await page
      .getByTestId('code-line')
      .fill(
        'Table = {Name = ["A", "B", "C", "D"] \n Values = [Unnamed1, Unnamed2, Unnamed3, Unnamed4]}'
      );
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('text-result:A')
        .getByText('A')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('text-result:B')
        .getByText('B')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('text-result:C')
        .getByText('C')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('text-result:D')
        .getByText('D')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('number-result:1')
        .getByText('1')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('number-result:2')
        .getByText('2')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('number-result:3')
        .getByText('3')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('number-result:4')
        .getByText('4')
    ).toBeVisible();
  });
});

const checkForError = (page: Page, value: string, row: number, col: number) =>
  test.step(`Checking for error`, async () => {
    await page.locator(editorTitleLocator()).click();
    await writeInTable(page, value, row, col);
    await page.getByText(value).hover();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.menuOpenDelay);
    await expect(page.getByText('Cannot parse')).toBeHidden();
  });

const changeToGBP = (page: Page, nth: number) =>
  test.step(`Checking for error`, async () => {
    await page.getByTestId('table-column-menu-button').nth(nth).click();
    await page.getByTestId('trigger-menu-item').getByText('Currency').click();
    await page.getByText('Currency').click();
    await page.getByText('GBP').click();
  });

test.describe('Make sure deleting decimals does not break parsing', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );

    await createWorkspace(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Creates a table and sets a value', async () => {
    await createTable(page);
    await writeInTable(page, '13.21', 1);
    await changeToGBP(page, 0);
  });

  test('Causes error by deleting values', async () => {
    await clickCell(page, 1);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Backspace');
    await clickCell(page, 2);
    await clickCell(page, 1);
    await page.getByText('13.').hover();
    // RGB 600, tooltips are too flaky to be tested
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
    const color = await page
      .getByText('13.')
      .first()
      .evaluate((element) =>
        window.getComputedStyle(element).getPropertyValue('color')
      );
    expect(color).toBe('rgb(192, 55, 55)');
  });

  test('Checks other cells', async () => {
    await checkForError(page, '13.21', 2, 0);
  });

  test('Checks other column', async () => {
    await changeToGBP(page, 1);
    await checkForError(page, '13.22', 1, 1);
  });

  test('Tests if adding the number back fixes parsing error', async () => {
    await clickCell(page, 1);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.type('25');
    await page.getByText('13.25').hover();
    // RGB 600, tooltips are too flaky to be tested
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
    const color = await page
      .getByText('13.25')
      .first()
      .evaluate((element) =>
        window.getComputedStyle(element).getPropertyValue('color')
      );
    expect(color).not.toBe('rgb(192, 55, 55)');
  });
});
