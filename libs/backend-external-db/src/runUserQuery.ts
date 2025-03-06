import Boom from '@hapi/boom';
import type { Knex } from 'knex';
import { createDatabaseClient } from './createDatabaseClient';
import { rowsToColumns } from './rowsToColumns';
import { knexRawResponseParser } from './types';

const MAX_COL_SIZE = 10000;

const parseResponse = (resp: unknown, clientConfig: Knex.Config): unknown => {
  switch (clientConfig.client) {
    case 'pg':
      const parsedResponse = knexRawResponseParser.parse(resp);

      return rowsToColumns(parsedResponse);
    case 'mysql':
      if (Array.isArray(resp)) {
        return rowsToColumns(resp[0]);
      }
      return resp;
  }
  return resp;
};

const validateResponse = (resp: unknown): unknown => {
  if (resp && typeof resp === 'object') {
    Object.values(resp).forEach((value) => {
      if (Array.isArray(value)) {
        if (value.length > MAX_COL_SIZE) {
          throw Boom.badData(
            `Result has too much data. Please use a WHERE or a LIMIT clause to filter the result.`
          );
        }
      }
    });
  }
  return resp;
};

export const runUserQuery = async (url: string, query: string) => {
  const [client, clientConfig] = createDatabaseClient(url);
  let response;
  try {
    response = await client.raw(query);
  } catch (err) {
    throw Boom.badData((err as Error).message);
  } finally {
    await client.destroy();
  }
  return validateResponse(parseResponse(response, clientConfig));
};
