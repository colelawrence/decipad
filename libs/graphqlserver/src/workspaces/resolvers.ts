import assert from 'assert';
import { UserInputError } from 'apollo-server-lambda';
import {
  ID,
  GraphqlContext,
  WorkspaceRecord,
  WorkspaceInput,
  Workspace,
  PageInput,
  PermissionRecord,
  PadRecord,
} from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import {
  queryAccessibleResources,
  removeAllPermissionsFor,
} from '@decipad/services/permissions';
import { notifyAllWithAccessTo, subscribe } from '@decipad/services/pubsub';
import { create as createWorkspace2 } from '@decipad/services/workspaces';
import { requireUser, check, isAuthorized } from '../authorization';
import by from '../utils/by';
import paginate from '../utils/paginate';

export default {
  Query: {
    async getWorkspaceById(
      _: any,
      { id }: { id: ID },
      context: GraphqlContext
    ): Promise<WorkspaceRecord | undefined> {
      const resource = `/workspaces/${id}`;
      await check(resource, context, 'READ');

      const data = await tables();
      return data.workspaces.get({ id });
    },

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
    async createWorkspace(
      _: any,
      { workspace }: { workspace: WorkspaceInput },
      context: GraphqlContext
    ): Promise<WorkspaceRecord> {
      const user = requireUser(context);
      return await createWorkspace2(workspace, user);
    },

    async updateWorkspace(
      _: any,
      { id, workspace }: { id: ID; workspace: WorkspaceInput },
      context: GraphqlContext
    ) {
      const resource = `/workspaces/${id}`;
      await check(resource, context, 'WRITE');

      const data = await tables();
      const previousWorkspace = await data.workspaces.get({ id });
      if (!previousWorkspace) {
        throw new UserInputError('No such workspace');
      }

      const newWorkspace = { ...previousWorkspace, ...workspace };
      await data.workspaces.put(newWorkspace);

      await notifyAllWithAccessTo<WorkspaceRecord>(
        resource,
        'workspacesChanged',
        {
          updated: [
            {
              id,
              ...workspace,
            },
          ],
        }
      );

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

    async pads(
      workspace: Workspace,
      { page }: { page: PageInput },
      context: GraphqlContext
    ) {
      const user = requireUser(context);

      const query = {
        IndexName: 'byUserId',
        KeyConditionExpression:
          'user_id = :user_id and resource_type = :resource_type',
        FilterExpression: 'parent_resource_uri = :parent_resource_uri',
        ExpressionAttributeValues: {
          ':user_id': user.id,
          ':resource_type': 'pads',
          ':parent_resource_uri': `/workspaces/${workspace.id}`,
        },
      };

      const data = await tables();

      return await paginate<PermissionRecord, PadRecord>(
        data.permissions,
        query,
        page,
        async (permission: PermissionRecord) => {
          return data.pads.get({ id: permission.resource_id });
        }
      );
    },
  },
};
