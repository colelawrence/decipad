import { onDisconnect } from '@decipad/sync-connection-lambdas';
import { trace } from '@decipad/backend-trace';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import EventEmitter from 'events';

EventEmitter.defaultMaxListeners = 1000;

export const handler: APIGatewayProxyHandlerV2 = trace(async function ws(
  event
) {
  const connId = event.requestContext.connectionId;
  return onDisconnect(connId);
});
