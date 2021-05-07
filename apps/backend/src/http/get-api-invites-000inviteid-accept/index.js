const tables = require('@architect/shared/tables');
const NextAuthJWT = require('next-auth/jwt');
const handle = require('@architect/shared/handle');
const auth = require('@architect/shared/auth');

exports.handler = handle(async (event) => {
  const { user } = await auth(event, { NextAuthJWT });

  if (!user) {
    return {
      statusCode: 403,
      body: 'Forbidden',
    };
  }

  const data = await tables();

  const invite = await data.invites.get({
    id: event.pathParameters.inviteid,
  });
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
  const newPermission = {
    id: `/users/${user.id}${resource}`,
    resource_uri: resource,
    resource_type: invite.resource_type,
    resource_id: invite.resource_id,
    user_id: user.id,
    type: invite.permission,
    given_by_user_id: invite.invited_by_user_id,
  };

  await data.permissions.put(newPermission);

  await data.invites.delete({ id: invite.id });

  return {
    statusCode: 201,
  };
});
