import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  ControlPlus,
  focusOnBody,
  keyPress,
  setUp,
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
} from '../utils/page/Table';
import { Timeouts } from '../utils/src';

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
    await page.waitForSelector(
      '[data-testid="table-name-input"]:has-text("Table1")'
    );
    await page
      .locator('[data-testid="table-name-input"]:has-text("Table1")')
      .dblclick();
    await page.keyboard.type('NewTableName');
    await expect(page.getByText('NewTableName')).toBeVisible();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay); // IMPORTANT
    await createTable(page);
    await page.waitForSelector(
      '[data-testid="table-name-input"]:has-text("Table1")'
    );
    await page
      .locator('[data-testid="table-name-input"]:has-text("Table1")')
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
    await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');
    await page.keyboard.insertText('test copy and paste text');
    await ControlPlus(page, 'A');
    await ControlPlus(page, 'C');
    await writeInTable(page, '', 2, 0, 'NewTableName2');
    await ControlPlus(page, 'V');
    await keyPress(page, 'ArrowRight');
    await ControlPlus(page, 'V');
  });
});
