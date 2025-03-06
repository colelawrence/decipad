import { DataSource } from '../types';
import { airbyteClient } from './airByteClient';
import { getConnectionName } from './getConnectionName';

export const findConnection = async (
  workspaceId: string,
  sourceType: DataSource
) => {
  const expectedConnectionName = getConnectionName(workspaceId, sourceType);
  const client = airbyteClient();
  let finished = false;
  let offset = 0;
  while (!finished) {
    // eslint-disable-next-line no-await-in-loop
    const connections = await client.listConnections(offset, 100);
    const source = connections.find((s) => s.name === expectedConnectionName);
    if (source) {
      return source;
    }
    if (connections.length === 0 || connections.length !== 100) {
      finished = true;
      break;
    }
    offset += 100;
  }
  return undefined;
};
