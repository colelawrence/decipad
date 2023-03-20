/* eslint-disable playwright/no-force-option */
import { Page } from 'playwright';

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

export async function getFromTable(
  page: Page,
  line: number,
  col = 0,
  formula = false
) {
  return page
    .locator(
      formula ? tableCellLocator(line, col) : tableCellTextLocator(line, col)
    )
    .textContent();
}

export function clickCell(page: Page, line: number, col = 0) {
  return page.locator(tableCellLocator(line, col)).click({ force: true });
}

export async function writeInTable(
  page: Page,
  text: string,
  line: number,
  col = 0
) {
  await clickCell(page, line, col);
  await page.keyboard.type(text);
}

export function openRowMenu(page: Page, line: number) {
  return page
    .locator(`${tableRowLocator(line)} > th > div > button`)
    .click({ force: true });
}

export function focusOnTable(page: Page) {
  return page
    .locator('table > tbody > tr:nth-child(1) > td:nth-child(2)')
    .click();
}

export function addRow(page: Page) {
  return page
    .locator('table > tfoot > tr > th > button')
    .click({ force: true });
}

export async function addColumn(page: Page) {
  // eslint-disable-next-line playwright/no-force-option
  await page.locator('button[title="Add Column"]').click({ force: true });
}

export function openColumnMenu(page: Page, col: number) {
  return page
    .locator(
      `${tableRowLocator(0)} > th:nth-child(${
        col + 2
      }) button:has-text("Caret down")`
    )
    .click();
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
