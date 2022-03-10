import { HttpResponse } from '@architect/functions';
import { WSRequest } from '@decipad/backendtypes';
import { authenticate, AuthResult } from '@decipad/services/authentication';
import { wrapHandler } from '@decipad/services/monitor';
import { onConnect } from '@decipad/sync-connection-lambdas';
import { getDefined } from '@decipad/utils';
import Boom, { boomify } from '@hapi/boom';
import { docIdFromPath } from '../path';

function isValidAuthResult(authResult: AuthResult): boolean {
  return !!authResult.secret || !!authResult.user;
}

export const handler = wrapHandler(async function ws(
  event: WSRequest
): Promise<HttpResponse> {
  try {
    const authResult = (await authenticate(event)).filter(isValidAuthResult);
    if (!authResult.length) {
      throw Boom.unauthorized();
    }

    const connId = event.requestContext.connectionId;
    const qs = getDefined(event.queryStringParameters);
    const docId = docIdFromPath(qs.doc || '');
    if (!docId) {
      throw Boom.notAcceptable('no doc id');
    }
    const resource = `/pads/${docId}`;
    await onConnect(connId, resource, authResult);

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
    console.error('Error on connect:', e);
    return {
      statusCode: e.output.statusCode,
    };
  }
});
