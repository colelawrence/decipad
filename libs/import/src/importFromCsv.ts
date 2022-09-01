import { parse as parseCSV } from 'csv-parse';
import { Result } from '@decipad/computer';
import { toTable } from './utils/toTable';
import { pivot } from './utils/pivot';
import { Sheet, SpreadsheetValue } from './types';
import { ImportOptions } from './import';

const toColumnOriented = (rowOrientedData: SpreadsheetValue[][]): Sheet => {
  return {
    values: pivot(rowOrientedData),
  };
};

export const importFromCsv = async (
  resp: Response,
  options: ImportOptions
): Promise<Result.Result> => {
  const source = await resp.text();
  return new Promise((resolve, reject) => {
    const data: string[][] = [];
    const parser = parseCSV({ cast: true, trim: true });
    let isDone = false;
    parser.on('readable', () => {
      let row;
      while ((row = parser.read())) {
        if (!isDone) {
          data.push(row);
        }
      }
    });
    parser.once('end', () => {
      isDone = true;
      resolve(toTable(toColumnOriented(data), options) as Result.Result);
    });
    parser.once('error', reject);
    parser.end(source);
  });
};
