import { Doc as YDoc } from 'yjs';
import { HttpResponse } from '@architect/functions';
import Boom from '@hapi/boom';
import tables from '@decipad/services/tables';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import { LambdaWebsocketProvider } from '@decipad/y-lambdawebsocket';
import { getDefined } from '@decipad/utils';

export async function onMessage(
  connId: string,
  message: Uint8Array
): Promise<HttpResponse> {
  const data = await tables();
  const conn = await data.connections.get({ id: connId });
  if (!conn) {
    throw Boom.resourceGone();
  }
  const resource = getDefined(conn.room, 'no room in connection');
  const doc = new YDoc();
  const persistence = new DynamodbPersistence(resource, doc);
  const comms = new LambdaWebsocketProvider(resource, connId, doc);
  await persistence.flush();

  await comms.receive(message);

  await comms.flush();
  await persistence.flush();

  persistence.destroy();
  comms.destroy();
  doc.destroy();

  return { statusCode: 200 };
}
