import { Result, Time } from '@decipad/computer';
import { SeriesType, TableCellType } from '@decipad/editor-types';
import { parseDate } from '@decipad/editor-utils';

export interface ParseSeriesStartResult {
  error?: string;
  type: SeriesType;
  granularity?: Time.Specificity; // we'll use a union type when we add more series types
  value?: Result.OneResult;
}

const dateGranluarityTypes: Array<Extract<TableCellType, { kind: 'date' }>> = [
  { kind: 'date', date: 'year' },
  { kind: 'date', date: 'month' },
  { kind: 'date', date: 'day' },
  { kind: 'date', date: 'hour' },
  { kind: 'date', date: 'minute' },
  { kind: 'date', date: 'second' },
  { kind: 'date', date: 'millisecond' },
];

export const parseSeriesStart = (
  type: SeriesType,
  content: string
): ParseSeriesStartResult => {
  switch (type) {
    case 'date': {
      let lastError: Error | undefined;
      for (const granularityType of dateGranluarityTypes) {
        try {
          const date = parseDate(granularityType, content);
          if (date == null) {
            throw new Error('Could not parse date');
          }
          return {
            type,
            granularity: granularityType.date,
            value: BigInt(date.getTime()),
          };
        } catch (err) {
          lastError = err as Error;
        }
      }
      // no parsing resulted
      // let's return the last error
      return {
        type,
        error: lastError?.message,
      };
    }
    default:
      throw new Error(`unknown series type ${type}`);
  }
};
