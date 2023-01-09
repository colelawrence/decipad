import { afterConnect } from '@decipad/sync-connection-lambdas';
import { EventEmitter } from 'events';
import handle from '../handle';

EventEmitter.defaultMaxListeners = 1000;

export const handler = handle(async (event) => {
  await afterConnect(event);
});
