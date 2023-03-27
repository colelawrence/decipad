import {
  GraphqlContext,
  ID,
  PadRecord,
  PagedResult,
  PageInput,
  Workspace,
  WorkspaceInput,
  WorkspaceRecord,
} from '@decipad/backendtypes';
import { pads } from '@decipad/services';
import {
  queryAccessibleResources,
  removeAllPermissionsFor,
} from '@decipad/services/permissions';
import { notifyAllWithAccessTo, subscribe } from '@decipad/services/pubsub';
import { create as createWorkspace2 } from '@decipad/services/workspaces';
import tables from '@decipad/tables';
import { byDesc } from '@decipad/utils';
import { UserInputError } from 'apollo-server-lambda';
import assert from 'assert';
import { maximumPermissionType } from '@decipad/graphqlresource';
import { resource } from '@decipad/backend-resources';
import { isAuthorized, loadUser, requireUser } from '../authorization';
import by from '../../../graphqlresource/src/utils/by';
import { workspaceResource } from './workspaceResource';

const workspaces = resource('workspace');

export default {
  Query: {
    async getWorkspaceById(
      _: unknown,
      { id }: { id: ID },
      context: GraphqlContext
    ): Promise<WorkspaceRecord | undefined> {
      await workspaces.expectAuthorizedForGraphql({
        context,
        recordId: id,
        minimumPermissionType: 'READ',
      });

      const data = await tables();
      return data.workspaces.get({ id });
    },

    async workspaces(
      _: unknown,
      __: unknown,
      context: GraphqlContext
    ): Promise<WorkspaceRecord[]> {
      const user = loadUser(context);
      if (!user) {
        return [];
      }
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

      const workspaceRecords = [];

      for (const permission of permissions) {
        // TODO should we use Promise.all?
        // eslint-disable-next-line no-await-in-loop
        const workspace = await data.workspaces.get({
          id: permission.resource_id,
        });
        if (workspace) {
          workspaceRecords.push(workspace);
        }
      }

      return workspaceRecords.sort(byDesc('name'));
    },
  },

  Mutation: {
    shareWorkspaceWithEmail: workspaceResource.shareWithEmail,
    unshareWorkspaceWithUser: workspaceResource.unshareWithUser,
    async createWorkspace(
      _: unknown,
      { workspace }: { workspace: WorkspaceInput },
      context: GraphqlContext
    ): Promise<WorkspaceRecord> {
      const user = requireUser(context);
      return createWorkspace2(workspace, user);
    },

    async updateWorkspace(
      _: unknown,
      { id, workspace }: { id: ID; workspace: WorkspaceInput },
      context: GraphqlContext
    ) {
      const { resources } = await workspaces.expectAuthorizedForGraphql({
        context,
        recordId: id,
        minimumPermissionType: 'WRITE',
      });

      const data = await tables();
      const previousWorkspace = await data.workspaces.get({ id });
      if (!previousWorkspace) {
        throw new UserInputError('No such workspace');
      }

      const newWorkspace = { ...previousWorkspace, ...workspace };
      await data.workspaces.put(newWorkspace);

      await notifyAllWithAccessTo<WorkspaceRecord>(
        resources,
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

    async removeWorkspace(
      _: unknown,
      { id }: { id: ID },
      context: GraphqlContext
    ) {
      const { resources } = await workspaces.expectAuthorizedForGraphql({
        context,
        recordId: id,
        minimumPermissionType: 'ADMIN',
      });

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

      // TODO should we use Promise.all?
      /* eslint-disable no-await-in-loop */
      for (const role of roles) {
        await data.workspaceroles.delete({ id: role.id });
        await removeAllPermissionsFor(`/roles/${role.id}`);
      }
      /* eslint-enable no-await-in-loop */

      await removeAllPermissionsFor(resources[0]);
    },
  },

  Subscription: {
    workspacesChanged: {
      async subscribe(_: unknown, __: unknown, context: GraphqlContext) {
        assert(context.subscriptionId, 'context does not have subscriptionId');
        assert(context.connectionId, 'context does not have connectionId');
        const user = requireUser(context);
        return subscribe({
          subscriptionId: context.subscriptionId,
          connectionId: context.connectionId,
          user,
          type: 'workspacesChanged',
        });
      },
    },
  },

  Workspace: {
    async roles(workspace: Workspace, _: unknown, context: GraphqlContext) {
      const user = requireUser(context);
      const data = await tables();
      let roles;

      const workspaceResourceName = `/workspaces/${workspace.id}`;
      if (await isAuthorized(workspaceResourceName, context, 'ADMIN')) {
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
          parentResourceUri: workspaceResourceName,
        });

        for (const roleResource of roleResources) {
          // TODO should we use Promise.all?
          // eslint-disable-next-line no-await-in-loop
          const role = await data.workspaceroles.get({
            id: roleResource.id,
          });
          if (role) {
            roles.push(role);
          }
        }
      }

      return roles.sort(byDesc('name'));
    },

    access: async (workspace: Workspace) => {
      const workspaceResourceName = `/workspaces/${workspace.id}`;
      const data = await tables();
      const permissions = (
        await data.permissions.query({
          IndexName: 'byResource',
          KeyConditionExpression: 'resource_uri = :resource_uri',
          ExpressionAttributeValues: {
            ':resource_uri': workspaceResourceName,
          },
        })
      ).Items;

      const roleAccesses = permissions
        .filter((p) => p.role_id !== 'null' && p.user_id === 'null')
        .map((p) => ({
          role_id: p.role_id,
          permission: p.type,
          canComment: p.can_comment,
          createdAt: p.createdAt,
        }))
        .sort(by('permission'));

      const userAccesses = permissions
        .filter((p) => p.user_id !== 'null' && p.role_id === 'null')
        .map((p) => ({
          user_id: p.user_id,
          permission: p.type,
          canComment: p.can_comment,
          createdAt: p.createdAt,
        }))
        .sort(by('permission'));

      return {
        roles: roleAccesses,
        users: userAccesses,
      };
    },

    myPermissionType: async (
      parent: WorkspaceRecord,
      _: unknown,
      context: GraphqlContext
    ) => {
      const workspaceResourceName = `/workspaces/${parent.id}`;
      const data = await tables();
      const { user } = context;
      const secret =
        context.event.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
      const FilterExpression = [
        user ? 'user_id = :user_id' : '',
        secret ? 'secret = :secret' : '',
      ]
        .filter(Boolean)
        .join(' OR ');
      const ExpressionAttributeValues: Record<string, string> = {
        ':resource_uri': workspaceResourceName,
      };
      if (user) {
        ExpressionAttributeValues[':user_id'] = user.id;
      }
      if (secret) {
        ExpressionAttributeValues[':secret'] = secret;
      }

      if (user || secret) {
        const permissions = (
          await data.permissions.query({
            IndexName: 'byResource',
            KeyConditionExpression: 'resource_uri = :resource_uri',
            FilterExpression,
            ExpressionAttributeValues,
          })
        ).Items;

        return maximumPermissionType(permissions);
      }
      return undefined;
    },

    async pads(
      workspace: Workspace,
      { page }: { page: PageInput }
    ): Promise<PagedResult<PadRecord>> {
      return pads.getWorkspaceNotebooks({
        workspaceId: workspace.id,
        page,
      });
    },
  },
};
