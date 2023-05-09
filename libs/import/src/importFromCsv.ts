import { parse as parseCSV } from 'csv-parse';
import { Computer, Result } from '@decipad/computer';
import { inferTable } from '@decipad/parse';
import { pivot } from './utils/pivot';
import { Sheet, SpreadsheetValue } from './types';
import type { ImportOptions } from './import';
import { trimSheet } from './utils/trimSheet';

const toColumnOriented = (rowOrientedData: SpreadsheetValue[][]): Sheet => {
  return {
    values: pivot(rowOrientedData),
  };
};

export const importFromCsv = (
  computer: Computer,
  source: string,
  options: ImportOptions
): Promise<Result.Result<'table'>> => {
  return new Promise((resolve, reject) => {
    const data: string[][] = [];
    const parser = parseCSV({
      cast: true,
      trim: true,
      delimiter: options.delimiter ?? [',', ';'],
      relax_quotes: true,
      relax_column_count: true,
      skip_empty_lines: true,
    });
    let isDone = false;
    parser.on('readable', () => {
      let row;
      while ((row = parser.read())) {
        if (!isDone) {
          data.push(row);
        }
      }
    });
    parser.once('end', async () => {
      isDone = true;
      try {
        const sheet = trimSheet(toColumnOriented(data));
        resolve(
          await inferTable(computer, sheet, {
            ...options,
            doNotTryExpressionNumbersParse: true,
          })
        );
      } catch (err) {
        reject(err);
      }
    });
    parser.once('error', reject);
    parser.end(source);
  });
};
