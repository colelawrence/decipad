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
    return {
      statusCode: 403,
    };
  }

  const connId = event.requestContext.connectionId;
  const docId = docIdFromPath(
    getDefined(
      getDefined(event.queryStringParameters).doc,
      'no doc in qs params'
    )
  );
  if (!docId) {
    throw Boom.notAcceptable('no doc id');
  }
  const resource = `/pads/${docId}`;
  return onConnect(connId, resource, authResult, event);
});
