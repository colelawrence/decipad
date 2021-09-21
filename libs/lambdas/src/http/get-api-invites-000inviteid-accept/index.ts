import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import Boom from '@hapi/boom';
import { HttpResponse } from '@architect/functions';
import { PermissionType } from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { expectAuthenticated } from '@decipad/services/authentication';
import handle from '../handle';

const permissionTypesToLevels = {
  READ: 0,
  WRITE: 1,
  ADMIN: 2,
};

export const handler = handle(
  async (event: APIGatewayProxyEvent): Promise<HttpResponse> => {
    const { user } = await expectAuthenticated(event);
    const data = await tables();

    const ids = event.pathParameters!.inviteid!.split(',');

    const returns = await Promise.all(
      ids.map(async (inviteId: string) => {
        const invite = await data.invites.get({ id: inviteId });
        if (!invite) {
          return {
            statusCode: 404,
            body: 'Invite not found',
          };
        }

        if (invite.user_id !== user.id) {
          throw Boom.forbidden('Forbidden');
        }

        const resource =
          invite.resource_uri ||
          `/${invite.resource_type}/${invite.resource_id}`;
        const permissionId = invite.permission_id;
        const oldPermission = await data.permissions.get({ id: permissionId });

        if (
          !oldPermission ||
          firstPermissionTypeSmallerThanSecond(
            oldPermission.type,
            invite.permission
          )
        ) {
          const newPermission = {
            id: permissionId,
            resource_uri: resource,
            resource_type: invite.resource_type,
            resource_id: invite.resource_id,
            role_id: invite.role_id,
            user_id: user.id,
            type: invite.permission,
            given_by_user_id: invite.invited_by_user_id,
            parent_resource_uri: invite.parent_resource_uri || undefined,
            can_comment: invite.can_comment || false,
          };

          await data.permissions.put(newPermission);
        }

        await data.invites.delete({ id: invite.id });
        return undefined;
      })
    );

    const errorReturns = returns.filter((ret) => ret && ret.statusCode !== 201);

    if (errorReturns.length > 0) {
      return errorReturns[0]!;
    }

    return {
      statusCode: 201,
    };
  }
);

function firstPermissionTypeSmallerThanSecond(
  perm1: PermissionType,
  perm2: PermissionType
): boolean {
  const level1 = permissionTypesToLevels[perm1];
  const level2 = permissionTypesToLevels[perm2];

  return level1 < level2;
}
