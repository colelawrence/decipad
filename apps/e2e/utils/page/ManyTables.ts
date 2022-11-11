import { Page } from 'playwright';
import { TableColumnHeader, TableRow, toAsciiTable } from '../src';

const tableNameSelector = (tableSelector: string): string => {
  return `${tableSelector} [aria-roledescription="table name"]`;
};

const fetchTableName = async (page: Page, tableSelector: string) => {
  return page.textContent(tableNameSelector(tableSelector));
};

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

  const texts = await Promise.all(
    handles.map((handle) => handle.textContent())
  );
  return texts.map((text) => filterCellText(text ?? ''));
};

const fetchAllSlateStringElements = async (
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

const fetchDataRowCount = async (
  page: Page,
  tableSelector: string
): Promise<number> => {
  return page.locator(`${tableSelector} tbody  tr`).count();
};

const fetchDataRows = async (
  page: Page,
  tableSelector: string
): Promise<TableRow[]> => {
  const rowCount = await fetchDataRowCount(page, tableSelector);
  const rows: TableRow[] = [];
  for (let i = 1; i <= rowCount; i += 1) {
    const cells = await fetchAllStringElements(
      page,
      `${tableRowSelector(tableSelector, i)} td`
    );
    rows.push({
      cells,
    });
  }

  return rows;
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
