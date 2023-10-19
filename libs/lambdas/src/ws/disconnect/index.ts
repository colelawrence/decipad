import { onDisconnect as onSyncDisconnect } from '@decipad/sync-connection-lambdas';
import { onDisconnect as onChatAgentDisconnect } from '@decipad/backend-notebook-assistant';
import { trace } from '@decipad/backend-trace';
import EventEmitter from 'events';
import { getDefined } from '@decipad/utils';
import {
  ConnectionRecord,
  TWSRequestContext,
  TWSRequestEvent,
} from '../../types';
import Boom from '@hapi/boom';
import tables from '@decipad/tables';

EventEmitter.defaultMaxListeners = 1000;

export const handler = trace<TWSRequestContext, TWSRequestEvent>(
  async (event) => {
    const data = await tables();
    const conn = await data.connections.get({
      id: getDefined(event.requestContext.connectionId),
    });
    if (!conn) {
      throw Boom.resourceGone();
    }

    if (typeof conn.protocol === 'number') {
      // sync protocol
      await onSyncDisconnect(conn as ConnectionRecord & { protocol: number });
    } else {
      // chat protocol
      await onChatAgentDisconnect(
        conn as ConnectionRecord & { protocol: string }
      );
    }
    return { statusCode: 200 };
  }
);
