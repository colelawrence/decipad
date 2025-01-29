/* eslint-disable no-console */
import {
  BigQuery,
  BigQueryDate,
  BigQueryDatetime,
  BigQueryTimestamp,
  BigQueryTime,
  BigQueryInt,
  type BigQueryOptions,
} from '@google-cloud/bigquery';
import { notAcceptable } from '@hapi/boom';
import { noop } from '@decipad/utils';
import { DatabaseClient, DatabaseClientConfig } from './types';
import { rowsToColumns } from './rowsToColumns';

const prepareCellForJSON = (cell: unknown): unknown => {
  if (
    cell instanceof BigQueryDate ||
    cell instanceof BigQueryDatetime ||
    cell instanceof BigQueryTimestamp ||
    cell instanceof BigQueryTime ||
    cell instanceof BigQueryInt
  ) {
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
    console.warn('Error caught in call to urlToCredentials with URL "%s"', url);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return prepareForJSON(rowsToColumns(result as any));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error caught in BigQuery client', err);
        throw err;
      }
    },
    destroy: noop, // nothing to do here
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return [wrappedClient as any, { connection: clientConfig }];
};
