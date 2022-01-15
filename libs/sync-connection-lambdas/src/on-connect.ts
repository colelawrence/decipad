import { queues, HttpResponse } from '@architect/functions';
import Boom from '@hapi/boom';
import { AuthResult } from '@decipad/services/authentication';
import { isAuthorized } from '@decipad/services/authorization';
import tables from '@decipad/tables';
import { WSRequest } from '@decipad/backendtypes';
import { getDefined } from '@decipad/utils';

export async function onConnect(
  connId: string,
  resource: string,
  auth: AuthResult,
  event: WSRequest
): Promise<HttpResponse> {
  const authorizationType = await isAuthorized({
    resource,
    user: auth.user,
    secret: auth.secret,
    minimumPermissionType: 'READ',
  });
  if (!authorizationType) {
    throw Boom.unauthorized();
  }

  const data = await tables();
  await data.connections.put({
    id: connId,
    user_id: auth.user?.id,
    room: resource,
    authorizationType,
    secret: auth.secret,
  });

  await queues.publish({
    name: 'sync-after-connect',
    payload: {
      connectionId: connId,
      resource,
    },
  });

  const wsProtocol = auth.gotFromSecProtocolHeader
    ? auth.token
    : event.headers['sec-websocket-protocol'] ||
      event.headers['Sec-WebSocket-Protocol'];

  return wsProtocol
    ? {
        statusCode: 200,
        headers: { 'Sec-WebSocket-Protocol': getDefined(wsProtocol) },
      }
    : { statusCode: 200 };
}
