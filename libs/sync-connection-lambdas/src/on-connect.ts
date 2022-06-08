import { queues } from '@architect/functions';
import { PermissionType, User } from '@decipad/backendtypes';
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

export async function onConnect(
  connId: string,
  resource: string,
  auth: AuthResult[]
): Promise<void> {
  try {
    let permissionTypes: PermissionType[];
    if (
      !auth.length &&
      (await isAuthorized({
        resource,
        user: undefined,
        secret: undefined,
        minimumPermissionType: 'READ',
      }))
    ) {
      permissionTypes = ['READ'];
    } else {
      permissionTypes = (
        await Promise.all(auth.map(authorizedForResource(resource)))
      ).filter(Boolean) as PermissionType[];
    }
    if (permissionTypes.length < 1) {
      throw Boom.unauthorized();
    }

    const data = await tables();
    await data.connections.put({
      id: connId,
      user_id: userFromAny(auth)?.id,
      room: resource,
      authorizationType: maximumPermissionIn(permissionTypes),
      secret: secretFromAny(auth),
    });

    await queues.publish({
      name: 'sync-after-connect',
      payload: {
        connectionId: connId,
        resource,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error caught on onConnect handler', err);
    throw err;
  }
}
