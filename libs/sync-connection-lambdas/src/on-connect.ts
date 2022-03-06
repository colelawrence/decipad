import { HttpResponse, queues } from '@architect/functions';
import { PermissionType, User, WSRequest } from '@decipad/backendtypes';
import { AuthResult } from '@decipad/services/authentication';
import {
  isAuthorized,
  maximumPermissionIn,
} from '@decipad/services/authorization';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';

const authorizedForResource =
  (resource: string) =>
  (auth: AuthResult): Promise<PermissionType | null> => {
    return isAuthorized({
      resource,
      user: auth.user,
      secret: auth.secret,
      minimumPermissionType: 'READ',
    });
  };

function userFromAny(authResults: AuthResult[]): User | undefined {
  const resultWithUser = authResults.find((result) => !!result.user);
  return resultWithUser?.user;
}

function secretFromAny(authResults: AuthResult[]): string | undefined {
  const resultWithoutUser = authResults.find((result) => !!result.user);
  if (resultWithoutUser?.secret) {
    return resultWithoutUser.secret;
  }
  return authResults.find((result) => !!result.secret)?.secret;
}

function gotFromSecProtocolHeader(
  authResults: AuthResult[]
): AuthResult | undefined {
  return authResults.find((result) => result.gotFromSecProtocolHeader);
}

export async function onConnect(
  connId: string,
  resource: string,
  auth: AuthResult[],
  event: WSRequest
): Promise<HttpResponse> {
  const authorizationTypes = (
    await Promise.all(auth.map(authorizedForResource(resource)))
  ).filter(Boolean) as PermissionType[];
  if (authorizationTypes.length < 1) {
    throw Boom.unauthorized();
  }

  const data = await tables();
  await data.connections.put({
    id: connId,
    user_id: userFromAny(auth)?.id,
    room: resource,
    authorizationType: maximumPermissionIn(authorizationTypes),
    secret: secretFromAny(auth),
  });

  await queues.publish({
    name: 'sync-after-connect',
    payload: {
      connectionId: connId,
      resource,
    },
  });

  const protocolAuth = gotFromSecProtocolHeader(auth);
  const wsProtocol =
    event.headers['sec-websocket-protocol'] ||
    event.headers['Sec-WebSocket-Protocol'];
  if (protocolAuth && wsProtocol) {
    return {
      statusCode: 200,
      headers: {
        'Sec-WebSocket-Protocol': wsProtocol,
      },
    };
  }

  return { statusCode: 200 };
}
