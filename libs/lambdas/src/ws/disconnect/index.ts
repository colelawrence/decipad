import { onDisconnect } from '@decipad/sync-connection-lambdas';
import { trace } from '@decipad/backend-trace';
import EventEmitter from 'events';
import { getDefined } from '@decipad/utils';
import { TWSRequestContext, TWSRequestEvent } from '../../types';

EventEmitter.defaultMaxListeners = 1000;

export const handler = trace<TWSRequestContext, TWSRequestEvent>((event) =>
  onDisconnect(getDefined(event.requestContext.connectionId))
);
