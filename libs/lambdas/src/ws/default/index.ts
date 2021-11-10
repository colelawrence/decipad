import { Buffer } from 'buffer';
import Boom from '@hapi/boom';
import { HttpResponse } from '@architect/functions';
import { WSRequest } from '@decipad/backendtypes';
import { wrapHandler } from '@decipad/services/monitor';
import { onMessage } from '@decipad/sync-connection-lambdas';
import tables from '@decipad/services/tables';

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
    return onMessage(connId, message);
  }
);
