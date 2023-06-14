import { afterConnect } from '@decipad/sync-connection-lambdas';
import { EventEmitter } from 'events';
import handle from '../handle';

EventEmitter.defaultMaxListeners = 1000;

export interface AfterConnectPayload {
  connectionId: string;
  resource: string;
}

export const handler = handle(async (event: AfterConnectPayload) => {
  await afterConnect(event);
});
