import Boom, { boomify } from '@hapi/boom';
import { onMessage as onSyncMessage } from '@decipad/sync-connection-lambdas';
import { onMessage as onChatAgentMessage } from '@decipad/backend-notebook-assistant';
import tables from '@decipad/tables';
import { captureException, trace } from '@decipad/backend-trace';
import EventEmitter from 'events';
import { getDefined } from '@decipad/utils';
import { TWSRequestContext } from '../../types';
import { getBody } from '../getBody';

EventEmitter.defaultMaxListeners = 1000;

export const handler = trace<TWSRequestContext>(
  async (event) => {
    const connId = getDefined(event.requestContext.connectionId);
    if (!event.body) {
      // do nothing
      return { statusCode: 200 };
    }
    const data = await tables();
    const conn = await data.connections.get({ id: connId });
    if (!conn) {
      throw Boom.resourceGone();
    }

    try {
      if (typeof conn.protocol === 'number') {
        return await onSyncMessage(conn, getBody(event.body));
      }
      return await onChatAgentMessage(conn, event.body, event.isBase64Encoded);
    } catch (err) {
      if (err instanceof Error) {
        const boom = boomify(err);
        if (boom.isServer) {
          console.error(boom);
          await captureException(err);
        }
        return { statusCode: boom.output.statusCode };
      }
      return { statusCode: 200 };
    }
  },
  {
    tracesSampleRate: 0.01,
  }
);
