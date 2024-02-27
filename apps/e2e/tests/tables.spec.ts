import { expect, test, Page } from './manager/decipad-tests';
import {
  focusOnBody,
  ControlPlus,
  keyPress,
  navigateToNotebook,
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
  doubleClickCell,
  downloadTableCSV,
  addColumnUnit,
} from '../utils/page/Table';

import notebookSource from '../__fixtures__/006-notebook-formula-tables.json';
import {
  snapshot,
  Timeouts,
  createWorkspace,
  importNotebook,
} from '../utils/src';
import fs from 'fs';
import path from 'path';

const getTableCellRenderCount = (page: Page) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page.evaluate(() => (window as any).tableCellRenderCount);

const STOP_RENDERING_POLL_INTERVAL = 5000;
const STOP_RENDERING_MAX_POLL_COUNT = 6;

const waitUntilStopRendering = async (page: Page): Promise<number> => {
  let previousRenderCount = await getTableCellRenderCount(page);

  for (let i = 0; i < STOP_RENDERING_MAX_POLL_COUNT; i += 1) {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(STOP_RENDERING_POLL_INTERVAL);
    const renderCount = await getTableCellRenderCount(page);
    if (renderCount === previousRenderCount) return renderCount;
    previousRenderCount = renderCount;
  }

  throw new Error('Timeout exceeded while waiting for table to stop rendering');
};

test('Count how many times table cells render', async ({ testUser }) => {
  await test.step('count initial renders', async () => {
    await testUser.notebook.focusOnBody();
    await createTable(testUser.page);

    const renderCount = await waitUntilStopRendering(testUser.page);

    /**
     * If this fails with a number less than what's currently expected, reduce
     * the expected count. Congratulations, you've made tables more efficient!
     */
    const cellCount = 9;
    const expectedPerCell = 3;
    expect(renderCount).toBe(cellCount * expectedPerCell);
  });
});

test('Basic Table Interactions + Collisions', async ({ testUser }) => {
  await test.step('creates 2 tables and names them', async () => {
    await testUser.notebook.focusOnBody();
    await createTable(testUser.page);
    await testUser.page
      .getByTestId('table-name-input')
      .getByText('Table')
      .waitFor();
    await testUser.page
      .getByTestId('table-name-input')
      .getByText('Table')
      .dblclick();
    await testUser.page.keyboard.type('NewTableName');
    await expect(testUser.page.getByText('NewTableName')).toBeVisible();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.computerDelay); // IMPORTANT
    await createTable(testUser.page);
    await testUser.page
      .getByTestId('table-name-input')
      .getByText('Table', { exact: true })
      .waitFor();
    await testUser.page
      .getByTestId('table-name-input')
      .getByText('Table', { exact: true })
      .dblclick();
    await testUser.page.keyboard.type('NewTableName2');
    await expect(testUser.page.getByText('NewTableName2')).toBeVisible();
  });

  await test.step('fills first table', async () => {
    // first column
    await writeInTable(testUser.page, 'Imports', 1, 0, 'NewTableName');
    expect(await getFromTable(testUser.page, 1, 0, 'NewTableName')).toBe(
      'Imports'
    );
    await writeInTable(
      testUser.page,
      'Hydro, wind and solar',
      2,
      0,
      'NewTableName'
    );
    await writeInTable(testUser.page, 'Bioenergy', 3, 0, 'NewTableName');

    // second column
    await writeInTable(testUser.page, '0.68%', 1, 1, 'NewTableName');
    expect(await getFromTable(testUser.page, 1, 1, 'NewTableName')).toBe(
      '0.68%'
    );
    await writeInTable(testUser.page, '3.02%', 2, 1, 'NewTableName');
    await writeInTable(testUser.page, '9.32%', 3, 1, 'NewTableName');
  });

  await test.step('adds sum smart row to percentages', async () => {
    await clickCalculateFirstColumn(testUser.page, 'NewTableName');
    await testUser.page.getByText('Sum').click();
    // check the 13.02 result
    await expect(testUser.page.getByText('13.02%')).toBeVisible();
  });

  await test.step('fills second table', async () => {
    await writeInTable(testUser.page, 'Imports', 1, 0, 'NewTableName2');
  });

  await test.step('adds 2 columns to first table', async () => {
    await addColumn(testUser.page, 'NewTableName');
    await addColumn(testUser.page, 'NewTableName');
  });

  await test.step('adds 2 columns to second table', async () => {
    await addColumn(testUser.page, 'NewTableName2');
    await addColumn(testUser.page, 'NewTableName2');
  });

  await test.step('adds col to the right', async () => {
    await addColRight(testUser.page, 2, 'NewTableName2');
    const table = getTableOrPage(testUser.page, 'NewTableName2');
    const headersCount = await table.getByTestId('table-header').count();

    expect(headersCount).toBe(6);
  });

  await test.step('adds col to the left', async () => {
    await addColLeft(testUser.page, 2, 'NewTableName2');
    const table = getTableOrPage(testUser.page, 'NewTableName2');
    const headersCount = await table.getByTestId('table-header').count();

    expect(headersCount).toBe(7);
  });

  await test.step('remove 2 columns from first table', async () => {
    await removeColumn(testUser.page, 3, 'NewTableName');
    await removeColumn(testUser.page, 2, 'NewTableName');
  });

  await test.step('remove 2 columns from second table', async () => {
    await removeColumn(testUser.page, 3, 'NewTableName2');
    await removeColumn(testUser.page, 2, 'NewTableName2');
  });

  await test.step('adds 2 rows to first table', async () => {
    await addRow(testUser.page, 'NewTableName');
    await addRow(testUser.page, 'NewTableName');
  });

  await test.step('adds 2 rows to second table', async () => {
    await addRow(testUser.page, 'NewTableName2');
    await addRow(testUser.page, 'NewTableName2');
  });

  await test.step('remove 2 rows to first table', async () => {
    await removeRow(testUser.page, 4, 'NewTableName');
    await removeRow(testUser.page, 4, 'NewTableName');
  });

  await test.step('remove 2 rows to second table', async () => {
    await removeRow(testUser.page, 4, 'NewTableName2');
    await removeRow(testUser.page, 4, 'NewTableName2');
  });

  await test.step('rename 2 columns to first table', async () => {
    await renameColumn(testUser.page, 1, 'NewColumName2', 'NewTableName');
    await renameColumn(testUser.page, 2, 'NewColumnName3', 'NewTableName');
  });

  await test.step('rename 2 columns to second table', async () => {
    await renameColumn(testUser.page, 1, 'NewColumName2', 'NewTableName2');
    await renameColumn(testUser.page, 2, 'NewColumnName3', 'NewTableName2');
  });

  await test.step('update 2 columns  data types from first table', async () => {
    await updateDataType(testUser.page, 1, 'NewTableName', 'Text', 'Text');
    await updateDataType(testUser.page, 2, 'NewTableName', 'Text', 'Text');
  });

  await test.step('update 2 columns  data types from second table', async () => {
    await updateDataType(testUser.page, 1, 'NewTableName2', 'Text', 'Text');
    await updateDataType(testUser.page, 2, 'NewTableName2', 'Text', 'Text');
  });

  await test.step('copy and paste', async () => {
    await testUser.page.getByTestId('paragraph-wrapper').nth(-1).click();
    await testUser.page.keyboard.insertText('test copy and paste text');
    await ControlPlus(testUser.page, 'A');
    await ControlPlus(testUser.page, 'C');
    await writeInTable(testUser.page, '', 2, 0, 'NewTableName2');
    await ControlPlus(testUser.page, 'V');
    await keyPress(testUser.page, 'ArrowRight');
    await ControlPlus(testUser.page, 'V');
  });
});

test('Basic Table', async ({ testUser }) => {
  await test.step('creates table', async () => {
    await testUser.notebook.focusOnBody();
    await createTable(testUser.page);
  });

  await test.step('deletes table and created a new table to check for name collisions', async () => {
    await deleteTable(testUser.page);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.typing);
    await createTable(testUser.page);
    await expect(
      await testUser.page.getByTestId('code-line-warning').count(),
      `calculation errors`
    ).toBe(0);
  });

  await test.step('fills table', async () => {
    // first column
    await writeInTable(testUser.page, 'Imports', 1, 0);
    expect(await getFromTable(testUser.page, 1, 0)).toBe('Imports');
    await writeInTable(testUser.page, 'Hydro, wind and solar', 2, 0);
    expect(await getFromTable(testUser.page, 2, 0)).toBe(
      'Hydro, wind and solar'
    );
    await writeInTable(testUser.page, 'Bioenergy', 3, 0);
    expect(await getFromTable(testUser.page, 3, 0)).toBe('Bioenergy');

    // second column
    await writeInTable(testUser.page, '0.68%', 1, 1);
    expect(await getFromTable(testUser.page, 1, 1)).toBe('0.68%');
    await writeInTable(testUser.page, '3.02%', 2, 1);
    expect(await getFromTable(testUser.page, 2, 1)).toBe('3.02%');
    await writeInTable(testUser.page, '9.32%', 3, 1);
    expect(await getFromTable(testUser.page, 3, 1)).toBe('9.32%');
  });

  await test.step('updates table name', async () => {
    await testUser.page.getByTestId('table-name-input').dblclick();
    await testUser.page.keyboard.type('NewTableName');
    await expect(testUser.page.getByText('NewTableName')).toBeVisible();
  });

  await test.step('can insert a new row below', async () => {
    await focusOnTable(testUser.page);
    await insertRowBelow(testUser.page, 3);
    await writeInTable(testUser.page, '1%', 4, 1);
    expect(await getFromTable(testUser.page, 4, 1)).toBe('1%');
  });

  await test.step('can insert a new row above', async () => {
    await focusOnTable(testUser.page);
    await insertRowAbove(testUser.page, 4);
    // row 4 with 1% is now row 5
    expect(await getFromTable(testUser.page, 5, 1)).toBe('1%');
  });

  await test.step("deleting table doesn't delete block after", async () => {
    await testUser.page.getByTestId('paragraph-content').click();
    await testUser.page.getByTestId('paragraph-content').dblclick();
    await testUser.page.keyboard.type('Hello, World');
    await testUser.notebook.deleteBlock(0);
    await expect(testUser.page.getByText('Hello, World')).toBeVisible();
  });
});

test('tests table date pickers', async ({ testUser }) => {
  let col;
  let line;
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  await test.step('checks table year picker', async () => {
    await focusOnBody(testUser.page);
    await createTable(testUser.page);
    line = 1;
    col = 1;
    await changeColumnYear(testUser.page, col);
    await doubleClickCell(testUser.page, line, col);

    await testUser.page.getByText('Today').isVisible();
    await snapshot(testUser.page as Page, 'Tables: Year Picker');
    await testUser.page.getByText('Today').click();
    await expect(
      testUser.page.locator(tableCellLocator(col, line))
    ).toContainText(`${year}`);
  });

  await test.step('checks table month picker', async () => {
    line = 1;
    col = 2;
    await changeColumnMonth(testUser.page, col);
    await doubleClickCell(testUser.page, line, col);

    await testUser.page.getByText('Today').isVisible();
    await snapshot(testUser.page as Page, 'Tables: Month Picker');
    await testUser.page.getByText('Today').click();

    await expect(
      testUser.page.locator(tableCellLocator(line, col))
    ).toContainText(`${year}-${month}`);
  });

  await test.step('checks table day picker', async () => {
    line = 1;
    col = 3;
    await addColumn(testUser.page);
    await changeColumnDay(testUser.page, col);
    await doubleClickCell(testUser.page, line, col);

    // skipping snapshot since the modal is the same as the date widget
    await testUser.page.getByText('Today').click();

    await expect(
      testUser.page.locator(tableCellLocator(line, col))
    ).toContainText(`${year}-${month}-${day}`);
  });
});

test('Number Parsing Checks', async ({ testUser }) => {
  await test.step('setup new notebook', async () => {
    await testUser.notebook.focusOnBody();
  });

  /**
   * Table pasted
   * +------+----------------+
   * | Type | Number         |
   * | 0    | $1.00          |
   * | 1    | $10.00         |
   * | 2    | $100.00        |
   * | 3    | $1,000.00      |
   * | 4    | $10,000.00     |
   * | 5    | $100,000.00    |
   * | 6    | $1,000,000.00  |
   * | 7    | $10,000,000.00 |
   * | 8    | $100,000,000.00|
   * +------+----------------+
   */
  await test.step('copy google sheet table', async () => {
    const textTable = fs.readFileSync(
      path.join(__dirname, '../__fixtures__/clipboard/google-sheets.txt'),
      'utf-8'
    );

    await testUser.writeToClipboard({
      'text/html': textTable,
    });

    await testUser.notebook.focusOnBody();
    await ControlPlus(testUser.page, 'V');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.syncDelay);
  });

  await test.step('update data type to number', async () => {
    await updateDataType(testUser.page, 1, undefined, 'Number', 'Number');
    await testUser.notebook.focusOnBody();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.syncDelay);
    await testUser.page.getByText('$100,000,000.00').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.syncDelay);
    await expect(
      testUser.page.getByText('Cannot parse number out of "$100,000,000.00"')
    ).toContainText('Cannot parse number out of "$100,000,000.00');
  });
});

export const typeTest = (currentPage: Page, input: string) =>
  test.step('Trying to add text to formulas', async () => {
    await currentPage.getByTestId('code-line').fill(input);
  });

test('Testing tables created from formulas', async ({ testUser }) => {
  let notebookId: string;
  let workspaceId: string;

  await test.step('create workspace and import notebook', async () => {
    workspaceId = await createWorkspace(testUser.page);
    notebookId = await importNotebook(
      workspaceId,
      Buffer.from(JSON.stringify(notebookSource), 'utf-8').toString('base64'),
      testUser.page
    );
    await navigateToNotebook(testUser.page, notebookId);
    await testUser.notebook.waitForEditorToLoad();
  });

  await test.step('Filling in the code and testing that the numbers are displayed properly', async () => {
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

    await testUser.page.getByTestId('code-line').click();
    await testUser.page
      .getByTestId('code-line')
      .fill(
        'Table = {Name = ["A", "B", "C", "D"] \n Values = [Unnamed1, Unnamed2, Unnamed3, Unnamed4]}'
      );

    const expectResults = [
      { result: 'A', searchText: 'text-result:A' },
      { result: 'B', searchText: 'text-result:B' },
      { result: 'C', searchText: 'text-result:C' },
      { result: 'D', searchText: 'text-result:D' },
      { result: '1', searchText: 'number-result:1' },
      { result: '2', searchText: 'number-result:2' },
      { result: '3', searchText: 'number-result:3' },
      { result: '4', searchText: 'number-result:4' },
    ];
    const expectPromises = expectResults.map(async (expectResult) =>
      expect(
        testUser.page
          .getByTestId('editor-table')
          .getByTestId(expectResult.searchText)
          .getByText(expectResult.result)
      ).toBeVisible()
    );
    await Promise.all(expectPromises);
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

test('Make sure deleting decimals does not break parsing', async ({
  testUser,
}) => {
  await test.step('Creates a table and sets a value', async () => {
    await createTable(testUser.page);
    await writeInTable(testUser.page, '13.21', 1);
    await updateDataType(
      testUser.page,
      0,
      undefined,
      'Number',
      'Currency',
      'GBP'
    );
  });

  await test.step('Causes error by deleting values', async () => {
    await doubleClickCell(testUser.page, 1); // |13.21|
    await testUser.page.keyboard.press('ArrowRight'); // 13.21|
    await testUser.page.keyboard.press('Backspace'); // 13.2|
    await testUser.page.keyboard.press('Backspace'); // 13.|
    await clickCell(testUser.page, 2);
    await clickCell(testUser.page, 1);
    await testUser.page.getByText('13.').hover();
    // RGB 600, tooltips are too flaky to be tested
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.chartsDelay);
    const color = await testUser.page
      .getByText('13.')
      .first()
      .evaluate((element) =>
        window.getComputedStyle(element).getPropertyValue('color')
      );
    expect(color).toBe('rgb(192, 55, 55)');
  });

  await test.step('Checks other cells', async () => {
    await checkForError(testUser.page, '13.21', 2, 0);
  });

  await test.step('Checks other column', async () => {
    await updateDataType(
      testUser.page,
      0,
      undefined,
      'Number',
      'Currency',
      'GBP'
    );
    await checkForError(testUser.page, '13.22', 1, 1);
  });

  await test.step('Tests if adding the number back fixes parsing error', async () => {
    await clickCell(testUser.page, 1);
    await doubleClickCell(testUser.page, 1); // |13.|
    await testUser.page.keyboard.press('ArrowRight'); // 13.|
    await testUser.page.keyboard.type('25'); // 13.25|
    await clickCell(testUser.page, 2);
    await testUser.page.getByText('13.25').hover();
    // RGB 600, tooltips are too flaky to be tested
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.chartsDelay);
    const color = await testUser.page
      .getByText('13.25')
      .first()
      .evaluate((element) =>
        window.getComputedStyle(element).getPropertyValue('color')
      );
    expect(color).not.toBe('rgb(192, 55, 55)');
  });
});

test('Paste table from Wikipedia', async ({ randomFreeUser }) => {
  const { page, notebook, workspace } = randomFreeUser;
  await test.step('set clipboard', async () => {
    const textTable = fs.readFileSync(
      path.join(__dirname, '../__fixtures__/clipboard/table1.txt'),
      'utf-8'
    );

    await randomFreeUser.writeToClipboard({
      'text/html': textTable,
    });
  });

  await test.step('paste table', async () => {
    await workspace.newWorkspaceWithPlan('team');
    await workspace.createNewNotebook();
    await randomFreeUser.aiAssistant.closePannel();
    await notebook.waitForEditorToLoad();
    await notebook.focusOnBody();
    await page.keyboard.press('Control+v');
  });

  await test.step("check that table's data is correct", async () => {
    expect(await getFromTable(page, 0, 0, 'Table')).toBe('Index');
    expect(await getFromTable(page, 0, 1, 'Table')).toBe('Driver');
    expect(await getFromTable(page, 0, 2, 'Table')).toBe('Age');
    expect(await getFromTable(page, 0, 3, 'Table')).toBe('Year');

    expect(await getFromTable(page, 2, 0, 'Table')).toBe('2');
    expect(await getFromTable(page, 2, 1, 'Table')).toBe('Lewis Hamilton');
    expect(await getFromTable(page, 2, 2, 'Table')).toBe('23 years, 300 days');
    expect(await getFromTable(page, 2, 3, 'Table')).toBe('2008');
  });

  await test.step('make changes in preparation for data view', async () => {
    await addColumn(page, 'Table');
    await renameColumn(page, 4, 'Checkbox', 'Table');
    await updateDataType(page, 0, 'Table', 'Number', 'Number');
    await updateDataType(page, 3, 'Table', 'Date', 'Year');
    await updateDataType(page, 4, 'Table', 'Checkbox');
    await page
      .getByRole('row', { name: 'Drag Handle 2 Lewis Hamilton' })
      .getByRole('checkbox')
      .click();
  });

  await test.step('create data view and display data from table', async () => {
    await notebook.addDataView();
    await page.getByTestId('data-view-source').click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.getByTestId('add-data-view-column-button').click();
    await page.getByRole('menuitem', { name: 'Index' }).click();
    await page.getByTestId('add-data-view-column-button').click();
    await page.getByRole('menuitem', { name: 'Driver' }).click();
    await page.getByTestId('add-data-view-column-button').click();
    await page.getByRole('menuitem', { name: 'Year' }).click();
    await page.getByTestId('add-data-view-column-button').click();
    await page.getByRole('menuitem', { name: 'Checkbox' }).click();

    await page.getByTestId('data-view-options-menu-Driver').click();
    await page.getByRole('menuitem', { name: 'Aggregate' }).click();
    await page.getByRole('menuitem', { name: 'Count Values' }).click();

    await page.getByTestId('data-view-options-menu-Year').click();
    await page.getByRole('menuitem', { name: 'Aggregate' }).click();
    await page.getByRole('menuitem', { name: 'Time span' }).click();

    await page.getByTestId('data-view-options-menu-Checkbox').click();
    await page.getByRole('menuitem', { name: 'Aggregate' }).click();
    await page.getByRole('menuitem', { name: 'Count true' }).click();
  });

  await test.step('check data view values are correct', async () => {
    await Promise.all([
      expect(
        page
          .locator('output')
          .filter({ hasText: 'Count values:' })
          .getByTestId('number-result:3')
      ).toBeVisible(),
      expect(
        page
          .locator('output')
          .filter({ hasText: 'Time span:' })
          .getByTestId('number-result:5 years')
      ).toBeVisible(),
      expect(
        page
          .locator('output')
          .filter({ hasText: 'Count true:' })
          .getByTestId('number-result:1')
      ).toBeVisible(),
    ]);
  });

  await test.step("download csv and check it's correct", async () => {
    const csvData = await downloadTableCSV(page, 'Table');
    expect(csvData).toBe(
      'Index,Driver,Age,Year,Checkbox\n1,"Sebastian Vettel","23 years, 134 days",2010,false\n2,"Lewis Hamilton","23 years, 300 days",2008,true\n3,"Fernando Alonso","24 years, 59 days",2005,false'
    );
  });
});

test('Starts editing cell on enter', async ({ testUser }) => {
  await test.step('create table', async () => {
    await createTable(testUser.page);
  });

  await test.step('edit cell', async () => {
    await writeInTable(testUser.page, 'before', 1);
    await clickCell(testUser.page, 1);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.tableDelay);
    await testUser.page.keyboard.press('Enter');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.tableDelay);
    await testUser.page.keyboard.type(' after');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.tableDelay);
    await testUser.page.keyboard.press('Enter');
  });

  await test.step('keyboard navigation', async () => {
    await testUser.page.keyboard.press('Enter');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.tableDelay);
    await testUser.page.keyboard.type('1,2', { delay: 100 });
    await testUser.page.keyboard.press('Enter');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.tableDelay);
    await testUser.page.keyboard.press('ArrowRight');
  });

  await test.step('use Shift Enter to move to the box above', async () => {
    await testUser.page.keyboard.press('Enter');
    await testUser.page.keyboard.type('2,3', { delay: 100 });
    await testUser.page.keyboard.press('Shift+Enter');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.tableDelay);
  });

  await test.step('use the up arrow key during edit mode', async () => {
    await testUser.page.keyboard.press('Enter');
    await testUser.page.keyboard.type('2,2', { delay: 100 });
    await testUser.page.keyboard.press('ArrowUp');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.tableDelay);
    await testUser.page.keyboard.type('2,1', { delay: 100 });
    await testUser.page.keyboard.press('Enter');
  });

  await test.step('check that cell is edited', async () => {
    const res = await Promise.all([
      getFromTable(testUser.page, 1, 0, 'Table'),
      getFromTable(testUser.page, 2, 0, 'Table'),
      getFromTable(testUser.page, 1, 1, 'Table'),
      getFromTable(testUser.page, 2, 1, 'Table'),
      getFromTable(testUser.page, 3, 1, 'Table'),
    ]);

    expect(res).toStrictEqual(['before after', '1.2', '2.1', '2.2', '2.3']);
  });
});

test('Table Custom Units', async ({ testUser: { page } }) => {
  await focusOnBody(page);
  await createTable(page);
  await addColumnUnit(page, 1, 'bananas');
  // second column
  await writeInTable(page, '1', 1, 1);
  await writeInTable(page, '2', 2, 1);
  await writeInTable(page, '3', 3, 1);
  expect(await getFromTable(page, 1, 1)).toBe('1 bananas');
  expect(await getFromTable(page, 2, 1)).toBe('2 bananas');
  expect(await getFromTable(page, 3, 1)).toBe('3 bananas');
});
