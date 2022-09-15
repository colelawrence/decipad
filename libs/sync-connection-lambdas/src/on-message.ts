import { Doc as YDoc } from 'yjs';
import { nanoid } from 'nanoid';
import arc, { HttpResponse } from '@architect/functions';
import Boom from '@hapi/boom';
import tables from '@decipad/tables';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import {
  LambdaWebsocketProvider,
  messageSync,
} from '@decipad/y-lambdawebsocket';
import * as decoding from 'lib0/decoding';
import { getDefined } from '@decipad/utils';
import { messageYjsSyncStep2, messageYjsUpdate } from 'y-protocols/sync';
import {
  hasMinimumPermission,
  parsePermissionType,
} from '@decipad/services/authorization';

type ErrorWithCode = Error & {
  code: string;
};

async function send(connId: string, message: Uint8Array): Promise<void> {
  const payload = Buffer.from(message).toString('base64');
  await arc.ws.send({ id: connId, payload });
}

async function trySend(connId: string, payload: Uint8Array): Promise<void> {
  try {
    await send(connId, payload);
  } catch (err) {
    if (!(err as ErrorWithCode)?.code?.match('Gone')) {
      throw err;
    }
    // eslint-disable-next-line no-console
    console.warn(`Could not send message to ${connId}: `, err);
  }
}

async function broadcast(
  room: string,
  message: Uint8Array,
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

  await Promise.all(
    conns
      .filter((conn) => conn.id !== from)
      .map((conn) => {
        return trySend(conn.id, message);
      })
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
        await data.docsyncupdates.put({
          id: resource,
          seq: `${Date.now()}:${nanoid()}`,
          data: Buffer.from(update).toString('base64'),
        });
      }
    }
  }
}

async function processMessage(
  resource: string,
  message: Uint8Array,
  connId: string,
  readOnly: boolean
): Promise<void> {
  const doc = new YDoc();
  const persistence = new DynamodbPersistence(resource, doc, readOnly);
  const comms = new LambdaWebsocketProvider(resource, connId, doc);
  await persistence.flush();

  await comms.receive(message);

  await comms.flush();
  await persistence.flush();

  persistence.destroy();
  comms.destroy();
  doc.destroy();
}

export async function onMessage(
  connId: string,
  message: Uint8Array
): Promise<HttpResponse> {
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

  const canWrite = hasMinimumPermission('WRITE')(permissions);

  const resource = getDefined(conn.room, 'no room in connection');
  const ops = [processMessage(resource, message, connId, !!canRead)];
  if (canWrite) {
    ops.push(broadcast(resource, message, connId));
    ops.push(maybeStoreMessage(resource, message));
  }
  await Promise.all(ops);

  return { statusCode: 200 };
}
