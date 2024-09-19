import {
  BigQuery,
  BigQueryDate,
  type BigQueryOptions,
} from '@google-cloud/bigquery';
import { notAcceptable } from '@hapi/boom';
import { noop } from '@decipad/utils';
import { DatabaseClient, DatabaseClientConfig } from './types';
import { rowsToColumns } from './rowsToColumns';

const prepareCellForJSON = (cell: unknown): unknown => {
  if (cell instanceof BigQueryDate) {
    return cell.value;
  }
  return cell;
};

const prepareForJSON = (
  data: Record<string, Array<unknown>>
): Record<string, Array<unknown>> =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      (Array.isArray(value) ? value : [value]).map(prepareCellForJSON),
    ])
  );

const urlToCredentials = (url: URL): BigQueryOptions['credentials'] => {
  try {
    return JSON.parse(Buffer.from(url.pathname, 'base64').toString('utf-8'));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    throw notAcceptable('Invalid BigQuery credentials');
  }
};

export const createBigQueryClient = (
  url: URL
): [DatabaseClient, DatabaseClientConfig] => {
  const clientConfig = {
    credentials: urlToCredentials(url),
  };
  const client = new BigQuery(clientConfig);
  const wrappedClient = {
    raw: async (query: string) => {
      try {
        const [result] = await client.query(query, { autoPaginate: false });
        if (!result) {
          throw new Error('BigQuery error: no result');
        }
        return prepareForJSON(rowsToColumns(result));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error caught in BigQuery client', err);
        throw err;
      }
    },
    destroy: noop, // nothing to do here
  };

  return [wrappedClient, { connection: clientConfig }];
};
