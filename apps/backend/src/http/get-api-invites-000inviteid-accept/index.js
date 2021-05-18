const tables = require('@architect/shared/tables');
const NextAuthJWT = require('next-auth/jwt');
const handle = require('@architect/shared/handle');
const auth = require('@architect/shared/auth');

const permissionTypesToLevels = {
  READ: 0,
  WRITE: 1,
  ADMIN: 2,
};

exports.handler = handle(async (event) => {
  const { user } = await auth(event, { NextAuthJWT });

  if (!user) {
    return {
      statusCode: 403,
      body: 'Forbidden',
    };
  }

  const data = await tables();

  const ids = event.pathParameters.inviteid.split(',');

  const returns = await Promise.all(
    ids.map(async (inviteId) => {
      const invite = await data.invites.get({ id: inviteId });
      if (!invite) {
        return {
          statusCode: 404,
          body: 'Invite not found',
        };
      }

      if (invite.user_id !== user.id) {
        return {
          statusCode: 403,
          body: 'Forbidden',
        };
      }

      const resource = `/${invite.resource_type}/${invite.resource_id}`;
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
          parent_resource_uri: invite.parent_resource_uri || null,
        };

        await data.permissions.put(newPermission);
      }

      await data.invites.delete({ id: invite.id });
    })
  );

  const errorReturns = returns.filter((ret) => ret && ret.statusCode !== 201);

  if (errorReturns.length > 0) {
    return errorReturns[0];
  }

  return {
    statusCode: 201,
  };
});

function firstPermissionTypeSmallerThanSecond(perm1, perm2) {
  const level1 = permissionTypesToLevels[perm1];
  const level2 = permissionTypesToLevels[perm2];

  return level1 < level2;
}
