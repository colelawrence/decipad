import { DataSource } from '../types';
import { airbyteClient } from './airByteClient';
import { findConnection } from './findConnection';
import { getConnectionName } from './getConnectionName';
import { getConnectionDef } from './sources/getConnectionDef';

const createConnection = async (
  sourceType: DataSource,
  expectedConnectionName: string,
  sourceId: string,
  destinationId: string
) => {
  const client = airbyteClient();
  return client.createConnection({
    name: expectedConnectionName,
    sourceId,
    destinationId,
    status: 'active',
    ...getConnectionDef(sourceType),
  });
};

export const ensureConnection = async (
  workspaceId: string,
  sourceType: DataSource,
  sourceId: string,
  destinationId: string
) => {
  let connection = await findConnection(workspaceId, sourceType);
  if (!connection) {
    connection = await createConnection(
      sourceType,
      getConnectionName(workspaceId, sourceType),
      sourceId,
      destinationId
    );
  }

  return connection;
};
