import Boom from '@hapi/boom';
import { HttpResponse } from '@architect/functions';
import { WSRequest } from '@decipad/backendtypes';
import { authenticate } from '@decipad/services/authentication';
import { wrapHandler } from '@decipad/services/monitor';
import { getDefined } from '@decipad/utils';
import { onConnect } from '@decipad/sync-connection-lambdas';
import { docIdFromPath } from '../path';

export const handler = wrapHandler(async function ws(
  event: WSRequest
): Promise<HttpResponse> {
  const authResult = await authenticate(event);
  if (!authResult.user && !authResult.secret) {
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
