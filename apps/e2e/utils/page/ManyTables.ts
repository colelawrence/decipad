import type { Page } from '@playwright/test';
import type { TableColumnHeader, TableRow } from '../src';
import { toAsciiTable } from '../src';

const tableNameSelector = (tableSelector: string): string => {
  return `${tableSelector} [aria-roledescription="table name"]`;
};

const fetchTableName = (page: Page, tableSelector: string) =>
  page.textContent(tableNameSelector(tableSelector));

const tableRowSelector = (tableSelector: string, row: number): string => {
  const parentType = row === 0 ? 'thead' : 'tbody';
  const rowNumber = row > 0 ? row - 1 : row;
  return `${tableSelector} ${parentType} tr:nth-child(${rowNumber + 1})`;
};

const filterCellText = (text: string): string => {
  return text.trim();
};

const fetchAllStringElements = async (
  page: Page,
  selector: string
): Promise<string[]> => {
  const handles = await page.locator(selector).elementHandles();

  const texts = await Promise.all(handles.map((handle) => handle.innerText()));
  return texts.map((text) => filterCellText(text ?? ''));
};

const fetchAllSlateStringElements = (
  page: Page,
  selector: string
): Promise<string[]> =>
  fetchAllStringElements(page, `${selector} [data-slate-string]`);

const fetchColumnHeaders = async (
  page: Page,
  tableSelector: string
): Promise<TableColumnHeader[]> => {
  const headerTexts = await fetchAllSlateStringElements(
    page,
    tableRowSelector(tableSelector, 0)
  );
  return headerTexts.map((text) => ({ name: text }));
};

const fetchDataRowCount = (
  page: Page,
  tableSelector: string
): Promise<number> => page.locator(`${tableSelector} tbody > tr`).count();

const fetchDataRows = async (
  page: Page,
  tableSelector: string
): Promise<TableRow[]> => {
  const rowCount = await fetchDataRowCount(page, tableSelector);
  const selectors = Array.from(
    { length: rowCount },
    (_, i) =>
      `${tableRowSelector(
        tableSelector,
        i + 1
      )} td div[contenteditable=false] > :first-child`
  );
  const cells = await Promise.all(
    selectors.map((selector) => fetchAllStringElements(page, selector))
  );
  const rows: TableRow[] = cells.map((cell) => ({ cells: cell }));
  return rows.filter((r) => r.cells.length > 0);
};

export const fetchTable = async (
  page: Page,
  tableSelector: string
): Promise<string> => {
  return toAsciiTable({
    name: (await fetchTableName(page, tableSelector)) ?? '',
    columnHeaders: await fetchColumnHeaders(page, tableSelector),
    rows: await fetchDataRows(page, tableSelector),
  });
};
