import Boom, { boomify } from '@hapi/boom';
import { onMessage } from '@decipad/sync-connection-lambdas';
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
      return await onMessage(connId, getBody(event.body));
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
