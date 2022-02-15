import { Table, Type, Utf8, Vector, vectorFromArray } from 'apache-arrow';
import parseCSV from 'csv-parse';
import { cast } from './cast';

type AcceptableCellType = number | boolean | string | Date;
type Row = AcceptableCellType[];
type Column = AcceptableCellType[];

export function csv(source: string): Promise<Table> {
  return new Promise((resolve, reject) => {
    let columnNames: string[];
    const data: AcceptableCellType[][] = [];
    const parser = parseCSV({ cast });
    let isDone = false;
    let hadFirstRow = false;
    parser.on('readable', () => {
      let row: AcceptableCellType[];
      while ((row = parser.read())) {
        if (!isDone) {
          if (!hadFirstRow) {
            columnNames = row.map((value) => value.toString());
            hadFirstRow = true;
          } else {
            data.push(row);
          }
        }
      }
    });
    parser.once('end', () => {
      isDone = true;
      resolve(toTable(columnNames, data));
    });
    parser.once('error', reject);
    parser.end(source);
  });
}

function toTable(
  columnNames: string[],
  rowOrientedData: AcceptableCellType[][]
): Table {
  const data = pivot(rowOrientedData);
  const columnMap: Record<string, Vector> = {};
  columnNames.forEach((columnName, index) => {
    const column = data[index];
    columnMap[columnName] = columnToArrowVector(column);
  });

  return new Table(columnMap);
}

function pivot(rows: Row[]): Column[] {
  const columns: Column[] = [];
  for (const row of rows) {
    row.forEach((cell, columnIndex) => {
      const column: Column = columns[columnIndex] || [];
      column.push(cell);
      columns[columnIndex] = column;
    });
  }
  return columns;
}

function columnToArrowVector(data: Column): Vector {
  const type = columnType(data);
  switch (type) {
    case Type.Float:
    case Type.Float16:
    case Type.Float32:
    case Type.Float64:
      return vectorFromArray(new Float64Array(data as number[]));
    case Type.Bool:
    case Type.DateDay:
    case Type.DateMillisecond:
    case Type.Utf8:
      return vectorFromArray(data);
    default:
      throw new Error(
        `don't know how to translate arrow type ${type} into a vector`
      );
  }
}

function columnType(data: Column) {
  for (let rowIndex = 0; rowIndex < data.length; rowIndex += 1) {
    const cell = data[rowIndex];
    if (cell instanceof Date) {
      return Type.DateMillisecond;
    }
    switch (typeof cell) {
      case 'boolean':
        return Type.Bool;
      case 'number':
        return Type.Float64;
      case 'string':
        return Type.Utf8;
    }
  }
  // return default type string
  return new Utf8();
}
