import { Doc as YDoc } from 'yjs';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import tables from '@decipad/tables';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import { LambdaWebsocketProvider } from '@decipad/y-lambdawebsocket';
import { getDefined, timeout } from '@decipad/utils';

export interface AfterConnectPayload {
  connectionId: string;
  resource: string;
}

export async function afterConnect({
  connectionId,
}: AfterConnectPayload): Promise<APIGatewayProxyResultV2> {
  const data = await tables();
  const conn = await data.connections.get({ id: connectionId });
  if (!conn) {
    return { statusCode: 410 };
  }
  const resource = getDefined(conn.room, 'no room in connection');
  const doc = new YDoc();
  const persistence = new DynamodbPersistence(resource, doc);
  const comms = new LambdaWebsocketProvider(resource, connectionId, doc, {
    protocolVersion: conn.protocol,
  });
  await persistence.flush();

  await comms.onOpen();

  await comms.flush();
  await persistence.flush();

  await timeout(1000);

  return { statusCode: 200 };
}
