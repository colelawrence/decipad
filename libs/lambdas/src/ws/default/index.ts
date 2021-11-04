import { Buffer } from 'buffer';
import Boom from '@hapi/boom';
import { HttpResponse, ws } from '@architect/functions';
import { WSRequest } from '@decipad/backendtypes';
import { wrapHandler } from '@decipad/services/monitor';
import { onMessage } from '@decipad/sync-connection-lambdas';
import tables from '@decipad/services/tables';
import { getDefined } from '@decipad/utils';

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

export const handler = wrapHandler(
  async (event: WSRequest): Promise<HttpResponse> => {
    const connId = event.requestContext.connectionId;
    if (!event.body) {
      throw Boom.badRequest();
    }
    const data = await tables();
    const conn = await data.connections.get({ id: connId });
    if (!conn) {
      throw Boom.resourceGone();
    }

    const message = Buffer.from(event.body, 'base64');
    const reply = (
      await Promise.all([
        broadcast(getDefined(conn.room), message, connId),
        onMessage(connId, message),
      ])
    )[1];
    return reply;
  }
);
