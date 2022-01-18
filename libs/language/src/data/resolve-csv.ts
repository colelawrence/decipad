import {
  Table,
  Field,
  Struct,
  Builder,
  Utf8,
  Float64,
  Bool,
  DateMillisecond,
} from '@apache-arrow/es5-cjs';
import parseCSV from 'csv-parse';
import { Buffer } from 'buffer';
import { cast } from './cast';
import { DataTable } from './DataTable';
import { bufferBody } from './buffer-body';

export async function resolveCsv(
  bodyStream: AsyncIterable<ArrayBuffer>
): Promise<DataTable> {
  const body = Buffer.from(await bufferBody(bodyStream)).toString('utf-8');
  return csv(body);
}

type AcceptableType = number | boolean | string | Date;

export async function csv(source: string): Promise<Table> {
  const [columnNames, data] = await csvToData(source);
  return toTable(columnNames, data);
}

export function csvToData(
  source: string
): Promise<[string[], AcceptableType[][]]> {
  return new Promise((resolve, reject) => {
    let columnNames: string[];
    const data: AcceptableType[][] = [];
    const parser = parseCSV({ cast });
    let isDone = false;
    let hadFirstRow = false;
    parser.on('readable', () => {
      let row: AcceptableType[];
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
      resolve([columnNames, data]);
    });
    parser.once('error', reject);
    parser.end(source);
  });
}

function toTable(columnNames: string[], data: AcceptableType[][]): Table {
  const fields = columnNames.map((columnName, columnIndex) => {
    const type = columnType(data, columnIndex);
    const nullable = true;
    return new Field(columnName, type, nullable);
  });

  const struct = new Struct(fields);
  const builder = Builder.new({ type: struct });
  for (const row of data) {
    builder.append(row);
  }
  builder.finish();
  return Table.fromStruct(builder.toVector());
}

export function columnType(data: AcceptableType[][], columnIndex: number) {
  for (let rowIndex = 0; rowIndex < data.length; rowIndex += 1) {
    const row = data[rowIndex] || [];
    const cell = row[columnIndex];
    if (cell instanceof Date) {
      return new DateMillisecond();
    }
    switch (typeof cell) {
      case 'boolean':
        return new Bool();
      case 'number':
        return new Float64();
      case 'string':
        return new Utf8();
    }
  }
  // return default type string
  return new Utf8();
}
