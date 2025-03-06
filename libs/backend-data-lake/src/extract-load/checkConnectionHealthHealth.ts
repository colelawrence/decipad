import { airbyteClient } from './airByteClient';
import { AirbyteConnection } from './types';

export const checkConnectionHealth = async (connection: AirbyteConnection) => {
  const client = airbyteClient();
  return client.checkConnectionHealth(connection);
};
