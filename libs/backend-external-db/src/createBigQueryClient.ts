/* eslint-disable no-console */
import { BigQuery, type BigQueryOptions } from '@google-cloud/bigquery';
import { notAcceptable } from '@hapi/boom';
import { noop } from '@decipad/utils';
import { DatabaseClient, DatabaseClientConfig } from './types';
import { rowsToColumns } from './rowsToColumns';
import { prepareForJSON } from './prepareForJson';

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
        const [result, , metadata] = await client.query(query, {
          autoPaginate: false,
        });
        if (!result) {
          throw new Error('BigQuery error: no result');
        }
        const fields: Array<{ name?: string; type?: string }> =
          metadata?.schema?.fields ?? [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return prepareForJSON(
          rowsToColumns({
            rows: result,
            fields,
          }),
          Object.fromEntries(
            fields.map((field) => [field.name ?? '', field.type ?? ''])
          )
        );
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
