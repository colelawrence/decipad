import { Doc as YDoc } from 'yjs';
import { nanoid } from 'nanoid';
import { HttpResponse, ws } from '@architect/functions';
import Boom from '@hapi/boom';
import tables from '@decipad/services/tables';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import {
  LambdaWebsocketProvider,
  messageSync,
} from '@decipad/y-lambdawebsocket';
import * as decoding from 'lib0/decoding';
import { getDefined } from '@decipad/utils';
import { messageYjsSyncStep2, messageYjsUpdate } from 'y-protocols/sync';

type ErrorWithCode = Error & {
  code: string;
};

async function send(connId: string, message: Uint8Array): Promise<void> {
  const payload = Buffer.from(message).toString('base64');
  await ws.send({ id: connId, payload });
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
  connId: string
): Promise<void> {
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
  const resource = getDefined(conn.room, 'no room in connection');

  await Promise.all([
    broadcast(getDefined(conn.room), message, connId),
    maybeStoreMessage(resource, message),
    processMessage(resource, message, connId),
  ]);

  return { statusCode: 200 };
}
