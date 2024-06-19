import { inferTable } from '@decipad/parse';
import { request } from '../../http/request';
import { Sheet, SpreadsheetValue } from '../../types';
import { trimSheet } from '../../utils/trimSheet';
import type { Provider } from '../types';
import Papaparse from 'papaparse';
import { pivot } from '../../utils/pivot';

const toColumnOriented = (rowOrientedData: SpreadsheetValue[][]): Sheet => {
  return {
    values: pivot(rowOrientedData),
  };
};

export const csv: Provider = {
  name: 'csv',
  matchUrl: () => true, // not used
  async import(params, options) {
    if (params.provider !== 'csv') {
      throw new Error('Should only have CSV provider here');
    }

    const response = await request(params.url, false, params);
    const textBody = response.body;
    if (typeof textBody !== 'string') {
      throw new Error('Expected string body');
    }

    const results = Papaparse.parse(textBody);

    const sheet = trimSheet(
      toColumnOriented(results.data as SpreadsheetValue[][])
    );

    const inferredCsv = await inferTable(params.computer, sheet, {
      ...options,
      doNotTryExpressionNumbersParse: true,
    });

    return [
      {
        result: inferredCsv,
        rawResult: textBody,
        loading: false,
      },
    ];
  },
};
