import { HttpResponse } from '@architect/functions';
import { WSRequest } from '@decipad/backendtypes';
import { onDisconnect } from '@decipad/sync-connection-lambdas';
import { trace } from '@decipad/backend-trace';

export const handler = trace(async function ws(
  event: WSRequest
): Promise<HttpResponse> {
  const connId = event.requestContext.connectionId;
  return onDisconnect(connId);
});
