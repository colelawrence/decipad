import { badRequest } from '@hapi/boom';

export const getConnectionConfig = (config: unknown): object => {
  if (config != null && typeof config === 'object') {
    return config;
  }
  throw badRequest('Invalid connection config');
};
