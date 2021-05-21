'use strict';

const arc = require('@architect/functions');
const { nanoid } = require('nanoid');
const { ForbiddenError, UserInputError } = require('apollo-server-lambda');
const tables = require('../../tables');
const { check, isAuthorized } = require('../authorization');

const resolvers = {
  Mutation: {
    async createRole(_, { role }, context) {
      const workspaceResource = `/workspaces/${role.workspaceId}`;
      await check(workspaceResource, context, 'ADMIN');

      const newRole = {
        id: nanoid(),
        name: role.name,
        workspace_id: role.workspaceId,
      };

      const data = await tables();
      await data.workspaceroles.put(newRole);
      return newRole;
    },

    async removeRole(_, { roleId }, context) {
      const data = await tables();
      const role = await data.workspaceroles.get({ id: roleId });
      if (!role) {
        throw new UserInputError('no such user');
      }

      if (role.system) {
        throw new UserInputError('cannot remove a system role');
      }

      const roleResource = `/roles/${role.id}`;
      const workspaceResource = `/workspaces/${role.workspace_id}`;
      if (
        !(await isAuthorized(roleResource, context, 'WRITE')) &&
        !(await isAuthorized(workspaceResource, context, 'ADMIN'))
      ) {
        throw new ForbiddenError('Forbidden');
      }

      const permissions = (
        await data.permissions.query({
          IndexName: 'byResource',
          KeyConditionExpression: 'resource_uri = :resource_uri',
          ExpressionAttributeValues: {
            ':resource_uri': roleResource,
          },
        })
      ).Items;

      if (permissions.length > 0) {
        throw new ForbiddenError('Cannot remove role that has users in');
      }

      await data.workspaceroles.delete({ id: roleId });
      return true;
    },

    async inviteUserToRole(_, { roleId, userId, permission }, context) {
      const data = await tables();
      const role = await data.workspaceroles.get({ id: roleId });
      if (!role) {
        throw new UserInputError('no such role');
      }

      const workspaceResource = `/workspaces/${role.workspace_id}`;
      const user = await check(workspaceResource, context, 'ADMIN');

      const invitedUser = await data.users.get({ id: userId });
      if (!invitedUser) {
        throw new UserInputError('no such user');
      }

      const workspace = await data.workspaces.get({ id: role.workspace_id });
      if (!workspace) {
        throw new UserInputError('no such workspace');
      }

      const newInviteForRole = {
        id: nanoid(),
        permission_id: `/users/${user.id}/roles/${roleId}/roles/${roleId}`,
        resource_type: 'roles',
        resource_id: roleId,
        user_id: userId,
        role_id: roleId,
        invited_by_user_id: user.id,
        permission,
        parent_resource_uri: workspaceResource,
        expires_at:
          Math.round(Date.now() / 1000) +
          Number(process.env.DECI_INVITE_EXPIRATION_SECONDS || 86400),
      };

      await data.invites.put(newInviteForRole);

      const newInviteForWorkspace = {
        id: nanoid(),
        permission_id: `/users/${user.id}/roles/${roleId}${workspaceResource}`,
        resource_type: 'workspaces',
        resource_id: workspace.id,
        user_id: userId,
        role_id: roleId,
        invited_by_user_id: user.id,
        permission,
        expires_at:
          Math.round(Date.now() / 1000) +
          Number(process.env.DECI_INVITE_EXPIRATION_SECONDS || 86400),
      };

      await data.invites.put(newInviteForWorkspace);

      const invites = [newInviteForRole, newInviteForWorkspace];
      const inviteIdsForURL = invites.map((i) => i.id).join(',');
      const inviteAcceptLink = `${process.env.DECI_APP_URL_BASE}/api/invites/${inviteIdsForURL}/accept`;

      await arc.queues.publish({
        name: 'sendemail',
        payload: {
          template: 'workspace-invite',
          from: user,
          to: invitedUser,
          workspace,
          inviteAcceptLink: inviteAcceptLink,
        },
      });

      return invites;
    },

    async removeUserFromRole(_, { roleId, userId }, context) {
      const data = await tables();
      const role = await data.workspaceroles.get({ id: roleId });
      if (!role) {
        throw new UserInputError('no such role');
      }

      const roleResource = `/roles/${role.id}`;
      const workspaceResource = `/workspaces/${role.workspace_id}`;
      if (
        !(await isAuthorized(roleResource, context, 'WRITE')) &&
        !(await isAuthorized(workspaceResource, context, 'ADMIN'))
      ) {
        throw new ForbiddenError('Forbidden');
      }

      await removeUserFromRole({ role, userId });

      return true;
    },

    async removeSelfFromRole(_, { roleId }, context) {
      const data = await tables();
      const role = await data.workspaceroles.get({ id: roleId });
      if (!role) {
        throw new UserInputError('no such user');
      }

      const roleResource = `/roles/${role.id}`;
      const user = await check(roleResource, context, 'READ');

      await removeUserFromRole({ role, userId: user.id });

      return true;
    },
  },

  Role: {
    async workspace(role, _, context) {
      const workspaceResource = `/workspaces/${role.workspace_id}`;
      await check(workspaceResource, context, 'READ');

      const data = await tables();
      return await data.workspaces.get({ id: role.workspace_id });
    },
    async users(role, _, context) {
      const roleResource = `/roles/${role.id}`;
      const workspaceResource = `/workspaces/${role.workspace_id}`;
      if (
        !(await isAuthorized(roleResource, context, 'READ')) &&
        !(await isAuthorized(workspaceResource, context, 'ADMIN'))
      ) {
        throw new ForbiddenError('Forbidden');
      }
      const data = await tables();
      const permissions = (
        await data.permissions.query({
          IndexName: 'byResource',
          KeyConditionExpression: 'resource_uri = :resource_uri',
          ExpressionAttributeValues: {
            ':resource_uri': roleResource,
          },
        })
      ).Items;

      const users = [];
      for (const permission of permissions) {
        const user = await data.users.get({ id: permission.user_id });
        if (user) {
          users.push(user);
        }
      }

      return users;
    },
  },
};

async function removeUserFromRole({ role, userId }) {
  const data = await tables();

  const permissions = (
    await data.permissions.query({
      IndexName: 'byUserAndRole',
      KeyConditionExpression: 'role_id = :role_id and user_id = :user_id',
      ExpressionAttributeValues: {
        ':role_id': role.id,
        ':user_id': userId,
      },
    })
  ).Items;

  if (permissions.length < 1) {
    throw new UserInputError('user not in role');
  }

  await checkIfCanRemoveUserFromRole({ role, userId });

  for (const permission of permissions) {
    await data.permissions.delete({ id: permission.id });
  }
}

async function checkIfCanRemoveUserFromRole({ role, userId }) {
  if (role.permission !== 'ADMIN') {
    return;
  }

  // User has the ADMIN role. Let's see if, by removing them, we still have
  // another user that is also admin.

  const data = await tables();

  const roles = (
    await data.workspaceroles.query({
      IndexName: 'byWorkspaceId',
      KeyConditionExpression: 'workspace_id = :workspace_id',
      ExpressionAttributeValues: {
        ':workspace_id': role.workspace_id,
      },
    })
  ).Items;

  let hasAnotherAdmin = false;
  for (const role of roles) {
    if (role.permission !== 'ADMIN') {
      continue;
    }

    const roleResource = `/roles/${role.id}`;
    const permissions = (
      await data.permissions.query({
        IndexName: 'byResource',
        KeyConditionExpression: 'resource_uri = :resource_uri',
        ExpressionAttributeValues: {
          ':resource_uri': roleResource,
        },
      })
    ).Items;

    if (permissions.some((permission) => permission.user_id !== userId)) {
      hasAnotherAdmin = true;
      break;
    }
  }

  if (!hasAnotherAdmin) {
    throw new ForbiddenError('Cannot remove sole admin');
  }
}

module.exports = resolvers;
