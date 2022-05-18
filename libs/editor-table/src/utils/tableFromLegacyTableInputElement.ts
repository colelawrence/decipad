import { nanoid } from 'nanoid';
import {
  ELEMENT_TABLE,
  TableHeaderRowElement,
  ELEMENT_TH,
  ELEMENT_TR,
  TableHeaderElement,
  TableRowElement,
  ELEMENT_TD,
  TableElement,
  TableInputElement,
  ELEMENT_TABLE_CAPTION,
  TableCaptionElement,
  ELEMENT_TABLE_VARIABLE_NAME,
} from '@decipad/editor-types';

export const tableFromLegacyTableInputElement = (
  element: TableInputElement
): TableElement => {
  const { tableData } = element;
  const headers: TableHeaderElement[] = [];
  for (const column of tableData.columns) {
    headers.push({
      id: nanoid(),
      type: ELEMENT_TH,
      cellType: column.cellType,
      children: [{ text: column.columnName }],
    });
  }
  const rows: TableRowElement[] = [];
  if (tableData.columns.length > 0) {
    const restOfTableColumns = tableData.columns.slice(1);
    const [firstColumn] = tableData.columns;
    firstColumn.cells.forEach((firstColumnCell, rowIndex) => {
      const rowCells = [
        firstColumnCell,
        ...restOfTableColumns.map((column) => column.cells[rowIndex]),
      ];
      rows.push({
        id: nanoid(),
        type: ELEMENT_TR,
        children: rowCells.map((rowCell) => ({
          id: nanoid(),
          type: ELEMENT_TD,
          children: [{ text: rowCell }],
        })),
      });
    });
  }
  const tableHeader: TableHeaderRowElement = {
    id: nanoid(),
    type: ELEMENT_TR,
    children: headers,
  };

  const caption: TableCaptionElement = {
    id: nanoid(),
    type: ELEMENT_TABLE_CAPTION,
    children: [
      {
        id: nanoid(),
        type: ELEMENT_TABLE_VARIABLE_NAME,
        children: [{ text: tableData.variableName }],
      },
    ],
  };

  return {
    id: element.id,
    type: ELEMENT_TABLE,
    children: [caption, tableHeader, ...rows],
  };
};
