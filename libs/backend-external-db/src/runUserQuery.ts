import Boom from '@hapi/boom';
import { Knex } from 'knex';
import { createDatabaseClient } from './createDatabaseClient';
import { rowsToColumns } from './rowsToColumns';

const parseResponse = (resp: unknown, clientConfig: Knex.Config): unknown => {
  switch (clientConfig.client) {
    case 'pg':
      if (resp && typeof resp === 'object' && 'rows' in resp) {
        const { rows } = resp;
        if (Array.isArray(rows) && rows.length) {
          return rowsToColumns(rows);
        }
        return resp;
      }
      break;
    case 'mysql':
      if (Array.isArray(resp) && resp.length) {
        return rowsToColumns(resp[0]);
      }
      return resp;
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
  return parseResponse(response, clientConfig);
};
