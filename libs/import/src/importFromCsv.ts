import { inferTable } from '@decipad/parse';
import type { Computer } from '@decipad/computer-interfaces';
import type { Result } from '@decipad/language-interfaces';
import { pivot } from './utils/pivot';
import type { ImportOptions, Sheet, SpreadsheetValue } from './types';
import { trimSheet } from './utils/trimSheet';
import papaparse from 'papaparse';

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
    const results = papaparse.parse(source);

    try {
      const sheet = trimSheet(
        toColumnOriented(results.data as SpreadsheetValue[][])
      );
      resolve(
        inferTable(computer, sheet, {
          ...options,
          doNotTryExpressionNumbersParse: true,
        })
      );
    } catch (err) {
      reject(err);
    }
  });
};
