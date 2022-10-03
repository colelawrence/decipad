import { TableColumnHeader, TableRow } from '../utils/types';
import { toAsciiTable } from '../utils/asciiTable';

const tableNameSelector = (tableSelector: string): string => {
  return `${tableSelector} [aria-roledescription="table name"]`;
};

const fetchTableName = async (tableSelector: string) => {
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

const fetchAllStringElements = async (selector: string): Promise<string[]> => {
  const handles = await page.locator(selector).elementHandles();

  const texts = await Promise.all(
    handles.map((handle) => handle.textContent())
  );
  return texts.map((text) => filterCellText(text ?? ''));
};

const fetchAllSlateStringElements = async (
  selector: string
): Promise<string[]> =>
  fetchAllStringElements(`${selector} [data-slate-string]`);

const fetchColumnHeaders = async (
  tableSelector: string
): Promise<TableColumnHeader[]> => {
  const headerTexts = await fetchAllSlateStringElements(
    tableRowSelector(tableSelector, 0)
  );
  return headerTexts.map((text) => ({ name: text }));
};

const fetchDataRowCount = async (tableSelector: string): Promise<number> => {
  return page.locator(`${tableSelector} tbody  tr`).count();
};

const fetchDataRows = async (tableSelector: string): Promise<TableRow[]> => {
  const rowCount = await fetchDataRowCount(tableSelector);
  const rows: TableRow[] = [];
  for (let i = 1; i <= rowCount; i += 1) {
    const cells = await fetchAllStringElements(
      `${tableRowSelector(tableSelector, i)} td`
    );
    rows.push({
      cells,
    });
  }

  return rows;
};

export const fetchTable = async (tableSelector: string): Promise<string> => {
  return toAsciiTable({
    name: (await fetchTableName(tableSelector)) ?? '',
    columnHeaders: await fetchColumnHeaders(tableSelector),
    rows: await fetchDataRows(tableSelector),
  });
};
