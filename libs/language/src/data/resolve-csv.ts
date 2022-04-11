import { Table, Type, Vector, vectorFromArray, Utf8 } from 'apache-arrow';
import { parse as parseCSV } from 'csv-parse';
import { cast } from './cast';
import { bufferBody } from './buffer-body';
import { RuntimeError } from '../interpreter';

type AcceptableCellType = number | boolean | string | Date;
type Row = AcceptableCellType[];
type Column = AcceptableCellType[];

export async function resolveCsv(
  bodyStream: AsyncIterable<ArrayBuffer>,
  maxRows: number
): Promise<Table> {
  const source = await bufferBody(bodyStream);
  return new Promise((resolve, reject) => {
    let columnNames: string[];
    const data: AcceptableCellType[][] = [];
    const parser = parseCSV({ cast });
    let isDone = false;
    let hadFirstRow = false;
    parser.on('readable', () => {
      if (data.length >= maxRows) {
        return;
      }
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
    if (!column) {
      throw new RuntimeError(`no data in column ${columnName}`);
    }
    try {
      columnMap[columnName] = columnToArrowVector(column);
    } catch (err) {
      try {
        columnMap[columnName] = columnToArrowVector(column, Type.Utf8);
      } catch (err2) {
        console.error(
          `Error trying to transform column ${columnName} into arrow vector`,
          err2
        );
        throw err2;
      }
    }
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

type ColumnType = Type.Bool | Type.Float64 | Type.Utf8 | Type.DateMillisecond;

function columnToArrowVector(data: Column, forceType?: ColumnType): Vector {
  const TType = forceType || columnType(data);
  switch (TType) {
    case Type.Float64:
      return vectorFromArray(new Float64Array(data as number[]));
    case Type.Bool:
    case Type.DateMillisecond:
      return vectorFromArray(data);
    case Type.Utf8:
      return vectorFromArray(data, new Utf8());
    default:
      throw new Error(
        `don't know how to translate arrow type ${TType} into a vector`
      );
  }
}

function columnType(data: Column): ColumnType {
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
  return Type.Utf8;
}
