import {
  changeVariableName,
  getTableLength,
  addColumn,
  changeColumnName,
  addRow,
  removeRow,
  changeCell,
  changeColumnType,
  validateCell,
} from './actions';
import { TableData } from './types';

expect.addSnapshotSerializer({
  test: (val) =>
    typeof val.variableName === 'string' && Array.isArray(val.columns),
  print: (val) => stringifyTable(val as TableData),
});

const stringifyTable = (table: TableData) => {
  const emptify = (cell: string) => (cell === '' ? '"" ' : cell);

  const tableContents = Array.from(
    { length: getTableLength(table) },
    (_, rowIndex) => {
      return table.columns
        .map((column) => emptify(column.cells[rowIndex]))
        .join(' | ');
    }
  );

  return [
    table.columns.map((col) => emptify(col.columnName)).join(' | '),
    '-'.repeat(table.columns.length * 6 - 3),
    ...tableContents,
  ].join('\n');
};

const testTable: TableData = {
  variableName: 'Table',
  columns: [
    {
      columnName: 'Str',
      cellType: 'string',
      cells: ['Hey'],
    },
    {
      columnName: 'Num',
      cellType: 'number',
      cells: ['123'],
    },
  ],
};

it('changes the variable name', () => {
  expect(changeVariableName(testTable, 'newName')).toMatchObject({
    variableName: 'newName',
  });
});

it('can add columns', () => {
  expect(addColumn(testTable)).toMatchInlineSnapshot(`
    Str | Num | "" 
    ---------------
    Hey | 123 | "" 
  `);
});

it('can rename columns', () => {
  expect(changeColumnName(testTable, 1, 'NEW')).toMatchInlineSnapshot(`
    Str | NEW
    ---------
    Hey | 123
  `);
});

it('can validate a cell', () => {
  expect(validateCell('number', '1')).toEqual(true);
  expect(validateCell('number', 'Hey')).toEqual(false);
  expect(validateCell('string', 'Hey')).toEqual(true);
});

it('can change the column type and clear now-invalid data', () => {
  const stringAsNumber = changeColumnType(testTable, 0, 'number');
  expect(stringAsNumber.columns[0]).toMatchObject({
    cellType: 'number',
  });
  expect(stringAsNumber).toMatchInlineSnapshot(`
    Str | Num
    ---------
    ""  | 123
  `);

  expect(changeColumnType(testTable, 1, 'string')).toMatchInlineSnapshot(`
    Str | Num
    ---------
    Hey | 123
  `);
});

it('can remove rows from a table with more than one row', () => {
  const tableWithTwoRows = addRow(testTable);
  expect(removeRow(tableWithTwoRows, 0)).toMatchInlineSnapshot(`
    Str | Num
    ---------
    ""  | "" 
  `);
  expect(removeRow(tableWithTwoRows, 1)).toMatchInlineSnapshot(`
    Str | Num
    ---------
    Hey | 123
  `);
});

it('does not remove the last row, clears instead', () => {
  expect(removeRow(testTable, 0)).toMatchInlineSnapshot(`
    Str | Num
    ---------
    ""  | "" 
  `);
});

it('changes an individual cell', () => {
  const withDifferentCell = changeCell(testTable, {
    colIndex: 1,
    rowIndex: 0,
    newText: '999',
  });
  expect(withDifferentCell).toMatchInlineSnapshot(`
    Str | Num
    ---------
    Hey | 999
  `);
});

it('adds a row', () => {
  expect(addRow(testTable)).toMatchInlineSnapshot(`
    Str | Num
    ---------
    Hey | 123
    ""  | "" 
  `);
});
