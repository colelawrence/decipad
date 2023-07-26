/* eslint-disable no-underscore-dangle */
import { Doc as YDoc } from 'yjs';
import { nanoid } from 'nanoid';
import Boom from '@hapi/boom';
import tables from '@decipad/tables';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import {
  LambdaWebsocketProvider,
  messageSync,
  trySend,
  sender,
} from '@decipad/y-lambdawebsocket';
import * as decoding from 'lib0/decoding';
import { getDefined } from '@decipad/utils';
import { messageYjsSyncStep2, messageYjsUpdate } from 'y-protocols/sync';
import {
  hasMinimumPermission,
  parsePermissionType,
} from '@decipad/services/authorization';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { captureException } from '@decipad/backend-trace';
import { ConnectionRecord } from '@decipad/backendtypes';
import pSeries from 'p-series';

const send = async (conn: ConnectionRecord, message: Buffer) => {
  const messages: string[] = [];
  const s = sender(conn.protocol ?? 1);
  const sub = s.message.subscribe((m) => {
    messages.push(m);
  });
  s.send(message);
  sub.unsubscribe();

  for (const m of messages) {
    // eslint-disable-next-line no-await-in-loop
    await trySend(conn.id, m);
  }
};

async function broadcast(
  room: string,
  message: Buffer,
  from: string
): Promise<void> {
  const data = await tables();
  const conns = (
    await data.connections.query({
      IndexName: 'byRoom',
      KeyConditionExpression: 'room = :room',
      ExpressionAttributeValues: {
        ':room': room,
      },
    })
  ).Items;

  await pSeries(
    conns
      .filter((conn) => conn.id !== from)
      .map((conn) => () => send(conn, message))
  );
}

async function maybeStoreMessage(
  resource: string,
  message: Uint8Array
): Promise<void> {
  const decoder = decoding.createDecoder(message);
  const messageType = decoding.readVarUint(decoder);
  if (messageType === messageSync) {
    const messageSubType = decoding.readVarUint(decoder);
    if (
      messageSubType === messageYjsSyncStep2 ||
      messageSubType === messageYjsUpdate
    ) {
      const update = decoding.readVarUint8Array(decoder);
      if (update.length > 0) {
        const data = await tables();
        await data.docsyncupdates.put(
          {
            id: resource,
            seq: `${Date.now()}:${nanoid()}`,
            data: Buffer.from(update).toString('base64'),
          },
          0.1
        );
      }
    }
  }
}

async function processMessage(
  resource: string,
  message: Uint8Array,
  conn: ConnectionRecord,
  version: string | undefined,
  readOnly: boolean
): Promise<void> {
  const doc = new YDoc();
  const persistence = new DynamodbPersistence(resource, doc, version, readOnly);
  const comms = new LambdaWebsocketProvider(resource, conn.id, doc, {
    protocolVersion: conn.protocol,
  });
  await persistence.flush();

  await comms.receive(message);

  await comms.flush();
  await persistence.flush();

  persistence.destroy();
  comms.destroy();
  doc.destroy();
}

export async function _onMessage(
  connId: string,
  message: Uint8Array
): Promise<APIGatewayProxyResultV2> {
  const data = await tables();
  const conn = await data.connections.get({ id: connId });
  if (!conn) {
    throw Boom.resourceGone();
  }

  // let's assume that all messages are an attempt to write
  // and as such, we'll ignore any message coming from a connection
  // that doesn't have that permission.
  const type = conn.authorizationType;
  if (!type) {
    return { statusCode: 401 };
  }
  const permissions = [{ type: parsePermissionType(type) }];
  const canRead = hasMinimumPermission('READ')(permissions);
  if (!canRead) {
    return { statusCode: 401 };
  }

  const canWrite =
    hasMinimumPermission('WRITE')(permissions) && !conn.versionName;

  const resource = getDefined(conn.room, 'no room in connection');
  const ops = [
    processMessage(resource, message, conn, conn.versionName, !!canRead),
  ];
  if (canWrite) {
    ops.push(broadcast(resource, Buffer.from(message), connId));
    ops.push(maybeStoreMessage(resource, message));
  }
  await Promise.all(ops);

  return { statusCode: 200 };
}

export const onMessage = async (connId: string, message: Uint8Array) => {
  try {
    return await _onMessage(connId, message);
  } catch (err) {
    await captureException(err as Error);
    return { statusCode: 200 };
  }
};
