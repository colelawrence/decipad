import { DatabaseClientConfig } from './types';

export const filterConfig = (
  config: DatabaseClientConfig
): DatabaseClientConfig => {
  const { connection = {} } = config;
  // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
    password = undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
    credentials = undefined,
    ...restOfConnection
  } = typeof connection === 'object'
    ? (connection as NonNullable<DatabaseClientConfig['connection']>)
    : {};
  return {
    ...config,
    connection: restOfConnection,
  };
};
