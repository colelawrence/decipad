/* eslint-disable playwright/no-force-option */
import { Page } from '@playwright/test';
import { Timeouts } from '../src';
import { keyPress } from './Editor';

export async function createTable(page: Page) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/table');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.click('[data-testid="menu-item-table"]');
  await page.waitForSelector('[data-slate-editor] table');
}

export function tableRowLocator(line: number) {
  const parentType = line === 0 ? 'thead' : 'tbody';
  const lineNumber = line > 0 ? line - 1 : line;

  return `table > ${parentType} > tr:nth-child(${lineNumber + 1})`;
}

export function tableCellLocator(line: number, col = 0) {
  const cellType = line === 0 ? 'th' : 'td';
  return `${tableRowLocator(line)} > ${cellType}:nth-child(${col + 2})`;
}

export function tableCellTextLocator(line: number, col = 0) {
  return `${tableCellLocator(line, col)} span[data-slate-string="true"]`;
}

export function getTableOrPage(page: Page, tableName?: string) {
  return tableName
    ? page
        .getByRole('textbox')
        .locator('div')
        .filter({ hasText: tableName })
        .first()
    : page;
}

export async function getFromTable(
  page: Page,
  line: number,
  // eslint-disable-next-line default-param-last
  col = 0,
  // eslint-disable-next-line default-param-last
  formula = false,
  tableName?: string
) {
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  return getTableOrPage(page, tableName)
    .locator(
      formula ? tableCellLocator(line, col) : tableCellTextLocator(line, col)
    )
    .textContent();
}

export async function clickCell(
  page: Page,
  line: number,
  // eslint-disable-next-line default-param-last
  col = 0,
  tableName?: string
) {
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);

  return getTableOrPage(page, tableName)
    .locator(tableCellLocator(line, col))
    .click({ force: true, delay: 100 });
}

export async function clickCalculateFirstColumn(
  page: Page,
  tableName?: string
) {
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  return getTableOrPage(page, tableName)
    .getByRole('cell', { name: 'Calculate' })
    .first()
    .click({ force: true, delay: 100 });
}

export async function writeInTable(
  page: Page,
  text: string,
  line: number,
  // eslint-disable-next-line default-param-last
  col = 0,
  tableName?: string
) {
  await clickCell(page, line, col, tableName);
  await clickCell(page, line, col, tableName);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await page.keyboard.type(text);
}

export function openRowMenu(page: Page, line: number, tableName?: string) {
  return getTableOrPage(page, tableName)
    .locator(`${tableRowLocator(line)} > th > div > button`)
    .click({ force: true, delay: 100 });
}

export function focusOnTable(page: Page, tableName?: string) {
  return getTableOrPage(page, tableName)
    .locator('table > tbody > tr:nth-child(1) > td:nth-child(2)')
    .click();
}

export async function addRow(page: Page, tableName?: string) {
  focusOnTable(page, tableName);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  page.getByRole('button', { name: 'Add row' }).click({ force: true });
}

export async function removeRow(page: Page, line: number, tableName?: string) {
  focusOnTable(page, tableName);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await openRowMenu(page, line, tableName);
  await page.getByTestId('delete-row').click();
}

export async function insertRowAbove(page: Page, line: number) {
  await openRowMenu(page, line);
  await page.getByTestId('insert-row-above').click();
}

export async function insertRowBelow(page: Page, line: number) {
  await openRowMenu(page, line);
  await page.getByTestId('insert-row-below').click();
}

export async function addColumn(page: Page, tableName?: string) {
  focusOnTable(page, tableName);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  getTableOrPage(page, tableName)
    .locator('button[title="Add Column"]')
    .click({ force: true });
}

export function openColTypeMenu(page: Page, col: number, tableName?: string) {
  return getTableOrPage(page, tableName)
    .locator(`${tableRowLocator(0)}`)
    .getByTestId('table-column-menu-button')
    .nth(col)
    .click();
}

export async function openColMenu(page: Page, col: number, tableName?: string) {
  const table = getTableOrPage(page, tableName);
  const columnHeader = table
    .locator(`${tableRowLocator(0)}`)
    .getByTestId('table-header')
    .nth(col);

  await columnHeader.hover();
  await columnHeader.getByTestId('table-add-remove-column-button').click();
}

export function hideTable(page: Page, tableName?: string) {
  return getTableOrPage(page, tableName)
    .getByTestId('segment-button-trigger-table')
    .click();
}

export function deleteTable(page: Page) {
  page.getByTestId('drag-handle').first().click();
  return page.getByText('Delete').click();
}

export function showTable(page: Page, tableName?: string) {
  return getTableOrPage(page, tableName)
    .getByTestId('segment-button-trigger-table')
    .click();
}

export function hideFormulasTable(page: Page, tableName?: string) {
  return getTableOrPage(page, tableName)
    .getByTestId('segment-button-trigger-formula')
    .click();
}

export function showFormulasTable(page: Page, tableName?: string) {
  return getTableOrPage(page, tableName)
    .getByTestId('segment-button-trigger-formula')
    .click();
}

export async function removeColumn(
  page: Page,
  col: number,
  tableName?: string
) {
  await openColMenu(page, col, tableName);
  await page.getByText('Remove column').click();
}

export async function addColumnUnit(
  page: Page,
  col: number,
  unit: string,
  tableName?: string
) {
  await openColTypeMenu(page, col, tableName);
  await page.getByPlaceholder('add custom unit').click();
  await page.keyboard.type(unit);
  await keyPress(page, 'Enter');
}

export async function addColRight(page: Page, col: number, tableName?: string) {
  await openColMenu(page, col, tableName);
  await page.getByText('Add column right').click();
}

export async function addColLeft(page: Page, col: number, tableName?: string) {
  await openColMenu(page, col, tableName);
  await page.getByText('Add column left').click();
}

export async function updateDataType(
  page: Page,
  col: number,
  tableName?: string
) {
  await openColTypeMenu(page, col, tableName);
  await page.getByRole('menuitem', { name: 'Text' }).click();
}

export async function selectColumnName(
  page: Page,
  col: number,
  tableName?: string
) {
  return getTableOrPage(page, tableName)
    .locator(`${tableRowLocator(0)}`)
    .getByTestId('table-column-name')
    .nth(col)
    .dblclick();
}

export async function renameColumn(
  page: Page,
  col: number,
  identifier: string,
  tableName?: string
) {
  selectColumnName(page, col, tableName);
  await keyPress(page, 'Backspace');
  await page.keyboard.type(identifier);
}

export async function focusOnTableColumnFormula(
  page: Page,
  filterText?: string
) {
  if (!filterText) {
    await page.getByRole('code').click();
  } else {
    await page.getByRole('code').filter({ hasText: filterText }).click();
  }
}
