import { HttpResponse } from '@architect/functions';
import Boom from '@hapi/boom';
import { WSRequest } from '@decipad/backendtypes';
import { onMessage } from '@decipad/sync-connection-lambdas';
import tables from '@decipad/tables';
import { trace } from '@decipad/backend-trace';
import { Buffer } from 'buffer';

export const handler = trace(
  async (event: WSRequest): Promise<HttpResponse> => {
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

    const message = Buffer.from(event.body, 'base64');
    return onMessage(connId, message);
  },
  {
    tracesSampleRate: 0.01,
  }
);
