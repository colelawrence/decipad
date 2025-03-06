import { notFound } from '@hapi/boom';
import { findConnection } from '../extract-load/findConnection';
import { DataSource } from '../types';
import { checkConnectionHealth } from '../extract-load/checkConnectionHealthHealth';

export const checkConnection = async (
  workspaceId: string,
  sourceType: DataSource
) => {
  const connection = await findConnection(workspaceId, sourceType);
  if (!connection) {
    throw notFound('Connection not found');
  }
  return checkConnectionHealth(connection);
};
