/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import { resource } from '@decipad/backend-resources';
import { maximumPermissionType } from '@decipad/graphqlresource';
import {
  pads,
  permissions as servicePermissions,
  subscriptions,
} from '@decipad/services';
import {
  queryAccessibleResources,
  removeAllPermissionsFor,
} from '@decipad/services/permissions';
import { notifyAllWithAccessTo } from '@decipad/services/pubsub';
import { create as createWorkspace2 } from '@decipad/services/workspaces';
import tables from '@decipad/tables';
import { byDesc } from '@decipad/utils';
import { UserInputError } from 'apollo-server-lambda';
import { isAuthorized, loadUser, requireUser } from '../authorization';
import {
  cancelSubscriptionFromWorkspaceId,
  getWorkspaceSubscription,
} from '../workspaceSubscriptions/subscription.helpers';
import { getWorkspaceMembersCount } from './workspace.helpers';
import { workspaceResource } from './workspaceResource';
import { withSubscriptionSideEffects } from './workspaceStripeEffects';
import {
  PermissionType,
  Resolvers,
  Role,
  Workspace,
  WorkspaceAccess,
} from '@decipad/graphqlserver-types';
import { WorkspaceRecord } from '@decipad/backendtypes';
import by from 'libs/graphqlresource/src/utils/by';
import { padResource } from '../pads/padResource';
import Boom from '@hapi/boom';
import { app } from '@decipad/backend-config';

const workspaces = resource('workspace');

const isUnitTesting = !!Number(process.env.JEST_WORKER_ID);

function WorkspaceRecordToWorkspace(
  workspaceRecord: WorkspaceRecord
): Workspace {
  return {
    ...workspaceRecord,
    /* These fields are gathered by sub-resolvers */
    // membersCount: 0,
    // pads: {
    //   items: [],
    //   count: 0,
    //   hasNextPage: false,
    // },
    // secrets: [],
    // sections: [],
  } as unknown as Workspace;
}

function isLocalOrDev(): boolean {
  const url = process.env.DECI_APP_URL_BASE;
  const stagingRegex = /^https:\/\/\d{4}\.staging\.decipad\.com/;

  return (
    url == null ||
    url.startsWith('http://localhost') ||
    url.startsWith('http://127.0.0.1') ||
    url.startsWith('https://dev.decipad.com') ||
    stagingRegex.test(url)
  );
}

const getWorkspaceById: NonNullable<
  NonNullable<Resolvers['Query']>['getWorkspaceById']
> = async (_, { id }, context) => {
  await workspaces.expectAuthorizedForGraphql({
    context,
    recordId: id,
    minimumPermissionType: 'READ',
  });

  const data = await tables();
  const dbWorkspaces = await data.workspaces.get({ id });
  if (dbWorkspaces == null) {
    return null;
  }

  // Note: we return some dummy data for type safety.
  // But the relevant processing is done at the end of this file.
  // in computed properties.
  return WorkspaceRecordToWorkspace(dbWorkspaces);
};

const resolvers: Resolvers = {
  Query: {
    getWorkspaceById,

    async workspaces(_, __, context) {
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

      const myWorkspaces = (
        await Promise.all(
          permissions.map((p) =>
            getWorkspaceById({}, { id: p.resource_id }, context, {} as any)
          )
        )
      )
        .filter((w): w is Workspace => w != null)
        .map((w) => {
          if (isLocalOrDev() && w.name.includes('@n1n.co')) {
            w.isPremium = true;

            if (w.name.includes('team')) {
              w.plan = 'team';
            } else if (w.name.includes('enterprise')) {
              w.plan = 'enterprise';
            } else {
              w.plan = 'personal';
            }
          }

          // small hack to handle existing workspaces
          if (!w.plan) {
            w.plan = w.isPremium ? 'pro' : 'free';
          }
          return w;
        });

      return myWorkspaces.sort(byDesc('name'));
    },
  },

  Mutation: {
    async shareWorkspaceWithEmail(parent, args, context) {
      const sub = await getWorkspaceSubscription(args.id);
      if (sub == null) {
        throw Boom.unauthorized('Cannot share in a free workspace');
      }

      if (args.permissionType === 'READ') {
        // Readers do not count towards workspace seats.
        return WorkspaceRecordToWorkspace(
          await workspaceResource.shareWithEmail(parent, args, context)
        );
      }

      return WorkspaceRecordToWorkspace(
        await withSubscriptionSideEffects(workspaceResource.shareWithEmail)(
          parent,
          args,
          context
        )
      );
    },
    async unshareWorkspaceWithUser(parent, args, context) {
      return WorkspaceRecordToWorkspace(
        await withSubscriptionSideEffects(workspaceResource.unshareWithUser)(
          parent,
          args,
          context
        )
      );
    },
    async createWorkspace(_, { workspace }, context) {
      const user = requireUser(context);

      const resources = await servicePermissions.queryAccessibleResources({
        userId: user.id,
        resourceType: 'workspaces',
        parentResourceUri: null,
      });

      //
      // Let's check if the user has access to a workspace WITHOUT a subscription.
      // A workspace without subscription = a free workspace.
      //
      // And a free workspace can only have 1 member, meaning this workspace must
      // be the users own workspace.
      //

      const workspaceSubscriptions = await Promise.all(
        resources.map((r) => subscriptions.getWsSubscription(r.id))
      );

      const hasFreeWorkspace = workspaceSubscriptions.some(
        (w) => w === undefined
      );

      if (
        hasFreeWorkspace &&
        (app().environment === 'production' || isUnitTesting)
      ) {
        throw Boom.forbidden(
          'User already has a free workspace. Cannot create another'
        );
      }

      const newWorkspace = WorkspaceRecordToWorkspace(
        await createWorkspace2(workspace, user)
      );

      if (isLocalOrDev() && newWorkspace.name.includes('@n1n.co')) {
        newWorkspace.isPremium = true;

        if (newWorkspace.name.includes('team')) {
          newWorkspace.plan = 'team';
        } else if (newWorkspace.name.includes('enterprise')) {
          newWorkspace.plan = 'enterprise';
        } else {
          newWorkspace.plan = 'personal';
        }
      }

      return newWorkspace;
    },

    async updateWorkspace(_, { id, workspace }, context) {
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

      const newWorkspace: WorkspaceRecord = {
        ...previousWorkspace,
        ...workspace,
      };
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

      return WorkspaceRecordToWorkspace(newWorkspace);
    },

    async removeWorkspace(_, { id }, context) {
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

      const workspace = await data.workspaces.get({ id });

      if (workspace?.isPremium) {
        await cancelSubscriptionFromWorkspaceId(context.event, id);
      }

      // TODO should we use Promise.all?
      /* eslint-disable no-await-in-loop */
      for (const role of roles) {
        await data.workspaceroles.delete({ id: role.id });
        await removeAllPermissionsFor(`/roles/${role.id}`);
      }
      /* eslint-enable no-await-in-loop */

      await removeAllPermissionsFor(resources[0]);

      return true;
    },
  },

  Workspace: {
    async roles(workspace, _, context) {
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

      const roleAccess = roles.sort(byDesc('name'));

      return roleAccess as unknown as Array<Role>;
    },

    async access(workspace) {
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
        .filter((p) => p.role_id !== 'null')
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
          userId: p.user_id,
          permission: p.type,
          canComment: p.can_comment,
          createdAt: p.createdAt,
        }))
        .sort(by('permission'));

      return {
        id: workspace.id,
        roles: roleAccesses.map((r) => ({
          ...r,
          roleId: r.role_id,
        })),
        users: userAccesses,
      } as unknown as WorkspaceAccess;
    },

    async membersCount(workspace: Workspace) {
      return getWorkspaceMembersCount(workspace.id);
    },

    async myPermissionType(parent, _, context) {
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

        return (maximumPermissionType(permissions) as PermissionType) ?? null;
      }
      return undefined;
    },

    async isPremium(workspace) {
      if (isLocalOrDev() && workspace.name.includes('@n1n.co')) {
        return true;
      }

      return !!workspace.isPremium;
    },

    async pads(workspace, { page }) {
      const pagedDbPads = await pads.getWorkspaceNotebooks({
        workspaceId: workspace.id,
        page: {
          maxItems: page.maxItems,
          cursor: page.cursor ?? null,
        },
      });

      const pagedPadsItems = pagedDbPads.items.map(padResource.toGraphql);

      return {
        ...pagedDbPads,
        items: pagedPadsItems,
      };
    },
  },
};

export default resolvers;
