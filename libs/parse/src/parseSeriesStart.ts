import { Result, Time } from '@decipad/computer';
import { SeriesType } from '@decipad/editor-types';
import { parseDate } from './parseDate';

export interface ParseSeriesStartResult {
  error?: string;
  type: SeriesType;
  granularity?: Time.Specificity; // we'll use a union type when we add more series types
  value?: Result.OneResult;
}

export const parseSeriesStart = (
  type: SeriesType,
  content: string
): ParseSeriesStartResult => {
  switch (type) {
    case 'date': {
      const parsedDate = parseDate(content);
      if (!parsedDate) {
        return {
          type,
          error: 'Could not parse date',
        };
      }
      // no parsing resulted
      // let's return the last error
      return {
        type,
        granularity: parsedDate.specificity,
        value: BigInt(parsedDate.date.getTime()),
      };
    }
    default:
      throw new Error(`unknown series type ${type}`);
  }
};
