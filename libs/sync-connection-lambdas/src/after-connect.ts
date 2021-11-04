import { Doc as YDoc } from 'yjs';
import { HttpResponse } from '@architect/functions';
import Boom from '@hapi/boom';
import tables from '@decipad/services/tables';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import { LambdaWebsocketProvider } from '@decipad/y-lambdawebsocket';
import { getDefined } from '@decipad/utils';

export interface AfterConnectPayload {
  connectionId: string;
  resource: string;
}

export async function afterConnect({
  connectionId,
}: AfterConnectPayload): Promise<HttpResponse> {
  const data = await tables();
  const conn = await data.connections.get({ id: connectionId });
  if (!conn) {
    throw Boom.resourceGone();
  }
  const resource = getDefined(conn.room, 'no room in connection');
  const doc = new YDoc();
  const persistence = new DynamodbPersistence(resource, doc);
  const comms = new LambdaWebsocketProvider(resource, connectionId, doc);
  await persistence.flush();

  await comms.onOpen();

  await comms.flush();
  await persistence.flush();

  return { statusCode: 200 };
}
