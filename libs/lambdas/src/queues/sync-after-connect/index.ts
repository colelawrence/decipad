import { afterConnect } from '@decipad/sync-connection-lambdas';
import handle from '../handle';

export const handler = handle(async (event) => {
  await afterConnect(event);
});
