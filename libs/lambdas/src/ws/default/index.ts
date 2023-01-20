import Boom, { boomify } from '@hapi/boom';
import { onMessage } from '@decipad/sync-connection-lambdas';
import tables from '@decipad/tables';
import { trace } from '@decipad/backend-trace';
import { Buffer } from 'buffer';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import EventEmitter from 'events';

EventEmitter.defaultMaxListeners = 1000;

export const handler: APIGatewayProxyHandlerV2 = trace(
  async (event) => {
    console.log('WS DEFAULT', event);
    const connId = event.requestContext.connectionId;
    if (!event.body) {
      // do nothing
      return { statusCode: 200 };
    }
    const data = await tables();
    const conn = await data.connections.get({ id: connId });
    if (!conn) {
      throw Boom.resourceGone();
    }

    const { body } = event;
    if (
      !(body instanceof Uint8Array) &&
      !Buffer.isBuffer(body) &&
      typeof body !== 'string'
    ) {
      throw new Error(`Unsupported body type ${typeof body}`);
    }
    const message =
      body instanceof Uint8Array || Buffer.isBuffer(body)
        ? Buffer.from(body)
        : Buffer.from(body, 'base64');

    try {
      return await onMessage(connId, message);
    } catch (err) {
      if (err instanceof Error) {
        const boom = boomify(err);
        if (boom.isServer) {
          throw boom;
        }
      }
      return { statusCode: 200 };
    }
  },
  {
    tracesSampleRate: 0.01,
  }
);
