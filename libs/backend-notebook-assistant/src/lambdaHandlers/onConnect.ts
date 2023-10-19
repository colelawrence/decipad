import type { AuthResult } from '@decipad/services/authentication';
import { PermissionType } from '@decipad/backendtypes';
import {
  isAuthorized,
  maximumPermissionIn,
} from '@decipad/services/authorization';
import { unauthorized, notAcceptable } from '@hapi/boom';
import tables from '@decipad/tables';
import { timestamp } from '@decipad/backend-utils';
import { userFromAny } from './userFromAny';
import { roomNameFromResource } from './roomName';

const CONNECTION_EXPIRATION_TIME_SECONDS = 60 * 60 * 24;

const authorizedForResource =
  (resource: string) =>
  (auth: AuthResult): Promise<PermissionType | null> => {
    return isAuthorized({
      resource,
      user: auth.user,
      secret: auth.secret,
      minimumPermissionType: 'WRITE',
    });
  };

export interface OnConnectParams {
  connId: string;
  resources: string[];
  auth: AuthResult[];
  protocol: string;
}
export const onConnect = async ({
  connId,
  resources,
  auth,
  protocol,
}: OnConnectParams) => {
  if (protocol !== 'agent-chat-1') {
    throw notAcceptable(`Invalid protocol ${protocol}`);
  }
  const permissionTypes = (
    await Promise.all(
      resources
        .map((resource) => auth.map(authorizedForResource(resource)))
        .flat(1)
    )
  ).filter(Boolean) as PermissionType[];
  if (permissionTypes.length < 1) {
    throw unauthorized();
  }

  const data = await tables();
  const conn = {
    id: connId,
    user_id: userFromAny(auth)?.id,
    room: roomNameFromResource(resources[0], protocol),
    authorizationType: maximumPermissionIn(permissionTypes),
    protocol,
    expiresAt: timestamp() + CONNECTION_EXPIRATION_TIME_SECONDS,
  };
  await data.connections.put(conn);
};
