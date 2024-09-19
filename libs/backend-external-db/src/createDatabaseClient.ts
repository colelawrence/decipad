import Boom from '@hapi/boom';
import stringify from 'json-stringify-safe';
import knex from 'knex';
import { DatabaseClientConfig, type DatabaseClient } from './types';
import { createBigQueryClient } from './createBigQueryClient';

const supportedClients = new Set([
  'postgresql',
  'mysql',
  'mariadb',
  'cockroachdb',
  'redshift',
  'mssql',
  'oracledb',
  'bigquery',
]);

const knexClients = new Set([
  'postgresql',
  'mysql',
  'mariadb',
  'cockroachdb',
  'redshift',
  'mssql',
  'oracledb',
]);

const knexDrivers: Record<string, string> = {
  postgresql: 'pg',
  cockroachdb: 'pg',
  redshift: 'pg',
  mysql: 'mysql',
  mariadb: 'mysql',
  mssql: 'tedious',
  oracledb: 'oracledb',
};

export const createDatabaseClient = (
  _url: string
): [DatabaseClient, DatabaseClientConfig] => {
  let url: URL;
  try {
    url = new URL(_url);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    throw Boom.notAcceptable(`Invalid connection URL: ${stringify(_url)}`);
  }
  const client = url.protocol.replaceAll(':', '');
  if (!supportedClients.has(client)) {
    throw Boom.notAcceptable(
      `We don't support databases of type ${stringify(client)}`
    );
  }

  if (knexClients.has(client)) {
    const clientConfig = {
      client: knexDrivers[client] ?? client,
      debug: true,
      useNullAsDefault: true,
      connection: {
        user: url.username ? decodeURIComponent(url.username) : url.username,
        password: url.password
          ? decodeURIComponent(url.password)
          : url.password,
        host: url.hostname,
        port: !url.port ? undefined : Number(url.port),
        database: url.pathname.substring(1),
        // ssl: {
        //   rejectUnauthorized: false,
        // },
      },
    };
    return [knex(clientConfig), clientConfig];
  }
  switch (client) {
    case 'bigquery':
      return createBigQueryClient(url);
  }
  throw new TypeError(`Unknown client: ${client}`);
};
