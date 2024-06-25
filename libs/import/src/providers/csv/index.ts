import { request } from '../../http/request';
import type { Provider } from '../types';

// eslint-disable-next-line import/no-relative-packages, camelcase
import { parse_csv } from '../../../../compute-backend-js/src/wasm/compute_backend';
import { buildResult } from '@decipad/remote-computer';
import { SerializedType } from '@decipad/language-interfaces';
import DeciNumber, { N } from '@decipad/number';

type ParsedCsv = {
  column_names: Array<string>;
  column_values: Array<Array<string> | Array<boolean> | Array<number>>;
};

function getTypedColumn(
  column: ParsedCsv['column_values'][number]
): Array<string> | Array<boolean> | Array<DeciNumber> {
  if (column.length === 0) {
    throw new Error('cannot operate on empty columns. TODO');
  }

  const firstItem = column[0];
  if (typeof firstItem === 'number') {
    return column.map((v) => N(v));
  }

  return column as Array<string> | Array<boolean>;
}

function getColumnTypes(
  column: ParsedCsv['column_values'][number]
): SerializedType {
  if (column.length === 0) {
    throw new Error('cannot operate on empty columns. TODO');
  }

  switch (typeof column[0]) {
    case 'string':
      return {
        kind: 'string',
      };
    case 'boolean':
      return {
        kind: 'boolean',
      };
    default:
      return {
        kind: 'number',
      };
  }
}

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

    const parsedCsv = parse_csv(
      textBody,
      Boolean(options.useFirstRowAsHeader)
    ) as ParsedCsv;

    const tableResult = buildResult(
      {
        kind: 'table',
        indexName: parsedCsv.column_names[0],
        columnNames: parsedCsv.column_names,
        columnTypes: parsedCsv.column_values.map(getColumnTypes),
      },
      parsedCsv.column_values.map(getTypedColumn)
    );

    return [
      {
        result: tableResult,
        rawResult: textBody,
        loading: false,
      },
    ];
  },
};
