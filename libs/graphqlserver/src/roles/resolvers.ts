import arc from '@architect/functions';
import { nanoid } from 'nanoid';
import { ForbiddenError, UserInputError } from 'apollo-server-lambda';
import {
  ID,
  GraphqlContext,
  RoleInput,
  RoleRecord,
  PermissionType,
  PermissionRecord,
} from '@decipad/backendtypes';
import tables, { allPages } from '@decipad/services/tables';
import { auth as authConfig, app as appConfig } from '@decipad/config';
import { check, isAuthorized } from '../authorization';
import timestamp from '../utils/timestamp';

const { urlBase } = appConfig();
const { inviteExpirationSeconds } = authConfig();

async function checkIfCanRemoveUserFromRole({
  role,
  userId,
}: {
  role: RoleRecord;
  userId: ID;
}) {
  if (
    !(await isAuthorized(
      `/roles/${role.id}`,
      { user: { id: userId } },
      'ADMIN'
    ))
  ) {
    return;
  }

  // User has the ADMIN role. Let's see if, by removing them, we still have
  // another user that is also admin.

  const data = await tables();

  const otherRoles = (
    await data.workspaceroles.query({
      IndexName: 'byWorkspaceId',
      KeyConditionExpression: 'workspace_id = :workspace_id',
      ExpressionAttributeValues: {
        ':workspace_id': role.workspace_id,
      },
    })
  ).Items;

  let hasAnotherAdmin = false;
  for (const otherRole of otherRoles) {
    const roleResource = `/roles/${otherRole.id}`;
    const query = {
      IndexName: 'byResource',
      KeyConditionExpression: 'resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':resource_uri': roleResource,
      },
    };

    // TODO should we parallelize?
    // eslint-disable-next-line no-await-in-loop
    for await (const permission of allPages<PermissionRecord>(
      data.permissions,
      query
    )) {
      if (
        permission &&
        permission.type === 'ADMIN' &&
        permission.user_id !== userId
      ) {
        hasAnotherAdmin = true;
        break;
      }
    }
  }

  if (!hasAnotherAdmin) {
    throw new ForbiddenError('Cannot remove sole admin');
  }
}

async function removeUserFromRole({
  role,
  userId,
}: {
  role: RoleRecord;
  userId: ID;
}) {
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
    // TODO parallelize?
    // eslint-disable-next-line no-await-in-loop
    await data.permissions.delete({ id: permission.id });
  }
}

export default {
  Mutation: {
    async createRole(
      _: unknown,
      { role }: { role: RoleInput },
      context: GraphqlContext
    ): Promise<RoleRecord> {
      const workspaceResource = `/workspaces/${role.workspaceId}`;
      await check(workspaceResource, context, 'ADMIN');

      const newRole = {
        id: nanoid(),
        name: role.name,
        workspace_id: role.workspaceId,
      };

      const data = await tables();
      await data.workspaceroles.create(newRole);
      return newRole;
    },

    async removeRole(
      _: unknown,
      { roleId }: { roleId: ID },
      context: GraphqlContext
    ) {
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

    async inviteUserToRole(
      _: unknown,
      {
        roleId,
        userId,
        permission,
      }: { roleId: ID; userId: ID; permission: PermissionType },
      context: GraphqlContext
    ) {
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
        permission_id: `/users/${userId}/roles/${roleId}/roles/${roleId}`,
        resource_type: 'roles',
        resource_id: roleId,
        user_id: userId,
        role_id: roleId,
        invited_by_user_id: user.id,
        permission,
        parent_resource_uri: workspaceResource,
        expires_at: timestamp() + inviteExpirationSeconds,
      };

      await data.invites.create(newInviteForRole);

      const newInviteForWorkspace = {
        id: nanoid(),
        permission_id: `/users/${userId}/roles/${roleId}${workspaceResource}`,
        resource_type: 'workspaces',
        resource_id: workspace.id,
        user_id: userId,
        role_id: roleId,
        invited_by_user_id: user.id,
        permission,
        expires_at: timestamp() + inviteExpirationSeconds,
      };

      await data.invites.create(newInviteForWorkspace);

      const invites = [newInviteForRole, newInviteForWorkspace];
      const inviteIdsForURL = invites.map((i) => i.id).join(',');
      const inviteAcceptLink = `${urlBase}/api/invites/${inviteIdsForURL}/accept`;

      await arc.queues.publish({
        name: 'sendemail',
        payload: {
          template: 'workspace-invite',
          from: user,
          to: invitedUser,
          workspace,
          inviteAcceptLink,
        },
      });

      return invites;
    },

    async removeUserFromRole(
      _: unknown,
      { roleId, userId }: { roleId: ID; userId: ID },
      context: GraphqlContext
    ) {
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

    async removeSelfFromRole(
      _: unknown,
      { roleId }: { roleId: ID },
      context: GraphqlContext
    ) {
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
    async workspace(role: RoleRecord, _: unknown, context: GraphqlContext) {
      const workspaceResource = `/workspaces/${role.workspace_id}`;
      await check(workspaceResource, context, 'READ');

      const data = await tables();
      return data.workspaces.get({ id: role.workspace_id });
    },
    async users(role: RoleRecord, _: unknown, context: GraphqlContext) {
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
        // TODO parallelize?
        // eslint-disable-next-line no-await-in-loop
        const user = await data.users.get({ id: permission.user_id });
        if (user) {
          users.push(user);
        }
      }

      return users;
    },
  },
};
