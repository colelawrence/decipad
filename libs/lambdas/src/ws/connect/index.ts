import { HttpResponse } from '@architect/functions';
import { WSRequest } from '@decipad/backendtypes';
import { authenticate, AuthResult } from '@decipad/services/authentication';
import { wrapHandler } from '@decipad/services/monitor';
import { onConnect } from '@decipad/sync-connection-lambdas';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import { docIdFromPath } from '../path';

function isValidAuthResult(authResult: AuthResult): boolean {
  return !!authResult.secret || !!authResult.user;
}

export const handler = wrapHandler(async function ws(
  event: WSRequest
): Promise<HttpResponse> {
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
  return onConnect(connId, resource, authResult, event);
});
