import assert from 'assert';
import { nanoid } from 'nanoid';
import { UserInputError } from 'apollo-server-lambda';
import tables from '../../tables';
import { requireUser, check, isAuthorized } from '../authorization';
import createResourcePermission from '../../resource-permissions/create';
import queryAccessibleResources from '../../resource-permissions/query-accessible-resources';
import removeAllPermissionsFor from '../../resource-permissions/remove-all-permissions-for';
import by from '../utils/by';
import { notifyAllWithAccessTo, subscribe } from '../../pubsub';

export default {
  Query: {
    async workspaces(_: any, __: any, context: GraphqlContext) {
      const user = requireUser(context);
      const data = await tables();

      const permissions = (
        await data.permissions.query({
          IndexName: 'byUserId',
          KeyConditionExpression:
            'user_id = :user_id and resource_type = :resource_type',
          ExpressionAttributeValues: {
            ':user_id': user.id,
            ':resource_type': 'workspaces',
          },
        })
      ).Items;

      const workspaces = [];

      for (const permission of permissions) {
        const workspace = await data.workspaces.get({
          id: permission.resource_id,
        });
        if (workspace) {
          workspaces.push(workspace);
        }
      }

      return workspaces.sort(by('name'));
    },
  },

  Mutation: {
    async createWorkspace(_: any, { workspace }: { workspace: WorkspaceInput }, context: GraphqlContext) {
      const user = requireUser(context);

      const newWorkspace = {
        id: nanoid(),
        name: workspace.name,
      };

      const data = await tables();
      await data.workspaces.put(newWorkspace);

      const newWorkspaceAdminRole = {
        id: nanoid(),
        name: 'Administrator',
        permission: 'ADMIN',
        workspace_id: newWorkspace.id,
        system: true,
      };

      await data.workspaceroles.put(newWorkspaceAdminRole);

      await createResourcePermission({
        resourceType: 'roles',
        resourceId: newWorkspaceAdminRole.id,
        userId: user.id,
        type: 'ADMIN',
        roleId: newWorkspaceAdminRole.id,
        givenByUserId: user.id,
        parentResourceUri: `/workspaces/${newWorkspace.id}`,
      });

      await createResourcePermission({
        resourceType: 'workspaces',
        resourceId: newWorkspace.id,
        userId: user.id,
        type: 'ADMIN',
        roleId: newWorkspaceAdminRole.id,
        givenByUserId: user.id,
      });

      return newWorkspace;
    },

    async updateWorkspace(_: any, { id, workspace }: { id: ID, workspace: WorkspaceInput}, context: GraphqlContext) {
      const resource = `/workspaces/${id}`;
      await check(resource, context, 'WRITE');

      const data = await tables();
      const previousWorkspace = await data.workspaces.get({ id });
      if (!previousWorkspace) {
        throw new UserInputError('No such workspace');
      }

      const newWorkspace = { ...previousWorkspace, ...workspace };
      await data.workspaces.put(newWorkspace);

      await notifyAllWithAccessTo(resource, 'workspacesChanged', {
        updated: [
          {
            id,
            ...workspace,
          },
        ],
      });

      return newWorkspace;
    },

    async removeWorkspace(_: any, { id }: { id: ID }, context: GraphqlContext) {
      await check(`/workspaces/${id}`, context, 'ADMIN');

      const data = await tables();
      const roles = (
        await data.workspaceroles.query({
          IndexName: 'byWorkspaceId',
          KeyConditionExpression: 'workspace_id = :workspace_id',
          ExpressionAttributeValues: {
            ':workspace_id': id,
          },
        })
      ).Items;

      for (const role of roles) {
        await data.workspaceroles.delete({ id: role.id });
        await removeAllPermissionsFor(`/roles/${role.id}`);
      }

      await removeAllPermissionsFor(`/workspaces/${id}`);
    },
  },

  Subscription: {
    workspacesChanged: {
      async subscribe(_: any, __: any, context: GraphqlContext) {
        assert(context.subscriptionId, 'context does not have subscriptionId');
        assert(context.connectionId, 'context does not have connectionId');
        const user = requireUser(context);
        return await subscribe({
          subscriptionId: context.subscriptionId,
          connectionId: context.connectionId,
          user,
          type: 'workspacesChanged',
        });
      },
    },
  },

  Workspace: {
    async roles(workspace: Workspace, _: any, context: GraphqlContext) {
      const user = requireUser(context);
      const data = await tables();
      let roles;

      const workspaceResource = `/workspaces/${workspace.id}`;
      if (await isAuthorized(workspaceResource, context, 'ADMIN')) {
        roles = (
          await data.workspaceroles.query({
            IndexName: 'byWorkspaceId',
            KeyConditionExpression: 'workspace_id = :workspace_id',
            ExpressionAttributeValues: {
              ':workspace_id': workspace.id,
            },
          })
        ).Items;
      } else {
        roles = [];
        const roleResources = await queryAccessibleResources({
          userId: user.id,
          resourceType: 'roles',
          parentResourceUri: workspaceResource,
        });

        for (const roleResource of roleResources) {
          const role = await data.workspaceroles.get({
            id: roleResource.id,
          });
          if (role) {
            roles.push(role);
          }
        }
      }

      return roles.sort(by('name'));
    },
  },
};

