/* eslint-disable no-loop-func */
import { Path } from 'slate';
import { nanoid } from 'nanoid';
import { insertNodes } from '@udecode/plate';
import { format } from 'date-fns';
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyEditor,
  TableCellElement,
  TableCellType,
  TableElement,
  TableRowElement,
} from '@decipad/editor-types';
import { Computer, Result, SerializedType } from '@decipad/computer';

interface ImportTableProps {
  editor: MyEditor;
  insertPath: Path;
  table: Result.Result<'table'>;
  computer: Computer;
}

const valueToString = (result: Result.Result): string => {
  const { type, value } = result;
  if (value == null || typeof value === 'symbol') {
    return '';
  }
  if (type.kind === 'string') {
    return value.toString();
  }
  if (type.kind === 'date') {
    let fmt: string;
    switch (type.date) {
      case 'year':
        fmt = 'yyyy';
        break;
      case 'month':
        fmt = 'yyyy/MM';
        break;
      case 'day':
        fmt = 'yyyy/MM/dd';
        break;
      case 'hour':
        fmt = 'yyyy/MM/dd HH';
        break;
      case 'minute':
        fmt = 'yyyy/MM/dd HH:mm';
        break;
      case 'second':
      case 'millisecond':
        fmt = 'yyyy/MM/dd HH:mm:ss';
    }
    const tof = typeof value;
    if (tof !== 'bigint') {
      return '';
    }
    const date = new Date(Number(value));
    return format(date, fmt);
  }

  return value.toString();
};

const cellType = (type: SerializedType): TableCellType => {
  switch (type.kind) {
    case 'boolean':
    case 'date':
    case 'number':
    case 'string':
      return type;
    default:
      throw new Error(`Don't know how to convert cell of type ${type.kind}`);
  }
};

const dataRows = (table: Result.Result<'table'>): TableRowElement[] => {
  let it = -1;
  const rows: TableRowElement[] = [];
  const { columnTypes } = table.type;
  let hasMoreData = true;
  while (hasMoreData) {
    it += 1;
    const cells: Array<TableCellElement> = table.value.map((col, colIndex) => {
      if (col.length < it) {
        hasMoreData = false;
      }
      const text = valueToString({
        type: columnTypes[colIndex],
        value: col[it],
      });
      return {
        type: ELEMENT_TD,
        id: nanoid(),
        children: [
          {
            text,
          },
        ],
      };
    });
    if (hasMoreData) {
      rows.push({
        type: ELEMENT_TR,
        id: nanoid(),
        children: cells,
      });
    }
  }

  return rows;
};

const tableElement = (
  computer: Computer,
  table: Result.Result<'table'>
): TableElement => {
  return {
    id: nanoid(),
    type: ELEMENT_TABLE,
    children: [
      {
        type: ELEMENT_TABLE_CAPTION,
        id: nanoid(),
        children: [
          {
            id: nanoid(),
            type: ELEMENT_TABLE_VARIABLE_NAME,
            children: [
              { text: computer.getAvailableIdentifier('ImportedTable', 1) },
            ],
          },
        ],
      },
      {
        type: ELEMENT_TR,
        id: nanoid(),
        children: table.type.columnNames.map((columnName, columnIndex) => ({
          type: ELEMENT_TH,
          id: nanoid(),
          cellType: cellType(table.type.columnTypes[columnIndex]),
          children: [
            {
              text: columnName,
            },
          ],
        })),
      },
      ...dataRows(table),
    ],
  };
};

export const importTable = ({
  editor,
  insertPath,
  table,
  computer,
}: ImportTableProps): void => {
  const t = tableElement(computer, table);
  insertNodes(editor, t, {
    at: insertPath,
  });
};
