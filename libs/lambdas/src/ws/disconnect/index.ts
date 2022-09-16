import { onDisconnect } from '@decipad/sync-connection-lambdas';
import { trace } from '@decipad/backend-trace';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const handler: APIGatewayProxyHandlerV2 = trace(async function ws(
  event
) {
  const connId = event.requestContext.connectionId;
  return onDisconnect(connId);
});
