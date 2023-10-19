import { Doc as YDoc } from 'yjs';
import tables from '@decipad/tables';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import { LambdaWebsocketProvider } from '@decipad/y-lambdawebsocket';
import { getDefined } from '@decipad/utils';
import type { ConnectionRecord } from '@decipad/backendtypes';

export async function onDisconnect(
  conn: ConnectionRecord & { protocol: number }
) {
  const data = await tables();

  await data.connections.delete({ id: conn.id });

  const resource = getDefined(conn.room, 'no room in connection');
  const doc = new YDoc();
  const persistence = new DynamodbPersistence(resource, doc);
  const comms = new LambdaWebsocketProvider(resource, conn.id, doc, {
    protocolVersion: conn.protocol,
  });
  await persistence.flush();

  await comms.onClose();

  await comms.flush();
  await persistence.flush();

  persistence.destroy();
  comms.destroy();
  doc.destroy();
}
