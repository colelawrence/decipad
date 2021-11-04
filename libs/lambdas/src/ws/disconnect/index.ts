import { HttpResponse } from '@architect/functions';
import { WSRequest } from '@decipad/backendtypes';
import { wrapHandler } from '@decipad/services/monitor';
import { onDisconnect } from '@decipad/sync-connection-lambdas';

export const handler = wrapHandler(async function ws(
  event: WSRequest
): Promise<HttpResponse> {
  const connId = event.requestContext.connectionId;
  return onDisconnect(connId);
});
