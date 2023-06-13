import Boom from '@hapi/boom';
import stringify from 'json-stringify-safe';
import type { Knex } from 'knex';
import knex from 'knex';

const supportedClients = new Set([
  'postgresql',
  'mysql',
  'mariadb',
  'cockroachdb',
  'redshift',
  'mssql',
  'oracledb',
]);

const driverForClient: Record<string, string> = {
  postgresql: 'pg',
  cockroachdb: 'pg',
  redshift: 'pg',
  mysql: 'mysql',
  mariadb: 'mysql',
  mssql: 'tedious',
  oracledb: 'oracledb',
};

const filterConfig = (config: Knex.Config): Knex.Config => {
  const { connection = {} } = config;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password = undefined, ...restOfConnection } =
    typeof connection === 'object' ? (connection as Knex.ConnectionConfig) : {};
  return {
    ...config,
    connection: restOfConnection,
  };
};

export const createDatabaseClient = (_url: string): [Knex, Knex.Config] => {
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
  const clientConfig: Knex.Config = {
    client: driverForClient[client] ?? client,
    debug: true,
    useNullAsDefault: true,
    connection: {
      user: url.username,
      password: url.password,
      host: url.hostname,
      port: !url.port ? undefined : Number(url.port),
      database: url.pathname.substring(1),
      ssl: {
        rejectUnauthorized: false,
      },
    },
  };
  return [knex(clientConfig), filterConfig(clientConfig)];
};
