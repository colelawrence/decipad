import { authenticate, AuthResult } from '@decipad/services/authentication';
import { onConnect } from '@decipad/sync-connection-lambdas';
import { getDefined } from '@decipad/utils';
import { trace } from '@decipad/backend-trace';
import Boom, { boomify } from '@hapi/boom';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import EventEmitter from 'events';
import { docIdFromPath } from '../path';

EventEmitter.defaultMaxListeners = 1000;

function isValidAuthResult(authResult: AuthResult): boolean {
  return !!authResult.secret || !!authResult.user;
}

export const handler: APIGatewayProxyHandlerV2 = trace(async function ws(
  event
) {
  try {
    const authResult = (await authenticate(event)).filter(isValidAuthResult);

    const connId = event.requestContext.connectionId;
    const qs = getDefined(event.queryStringParameters);
    const docId = docIdFromPath(qs.doc || '');
    if (!docId) {
      throw Boom.notAcceptable('no doc id');
    }
    const version = docIdFromPath(qs.version || '');
    const resource = `/pads/${docId}`;
    await onConnect(connId, resource, version, authResult);

    const wsProtocol =
      event.headers['sec-websocket-protocol'] ||
      event.headers['Sec-WebSocket-Protocol'];
    return {
      statusCode: 200,
      headers: wsProtocol
        ? {
            'Sec-WebSocket-Protocol': wsProtocol,
          }
        : {},
    };
  } catch (err) {
    const e = boomify(err as Error);
    if (e.isServer) {
      console.error('Error on connect:', e);
      console.error('headers:', event.headers);
    }
    return {
      statusCode: e.output.statusCode,
    };
  }
});
