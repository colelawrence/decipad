'use strict';

const { nanoid } = require('nanoid');
const { UserInputError } = require('apollo-server-lambda');
const tables = require('../../tables');
const { requireUser, check, isAuthorized } = require('../authorization');
const createResourcePermission = require('../../resource-permissions/create');
const queryAccessibleResources = require('../../resource-permissions/query-accessible-resources');
const by = require('../utils/by');

const resolvers = {
  Query: {
    async workspaces(_, __, context) {
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
    async createWorkspace(_, { workspace }, context) {
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

    async updateWorkspace(_, { id, workspace }, context) {
      await check(`/workspaces/${id}`, context, 'WRITE');

      const data = await tables();
      const previousWorkspace = await data.workspaces.get({ id });
      if (!previousWorkspace) {
        throw new UserInputError('No such workspace');
      }

      const newWorkspace = Object.assign(previousWorkspace, workspace);
      await data.workspaces.put(newWorkspace);

      return newWorkspace;
    },
  },

  Workspace: {
    async roles(workspace, _, context) {
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

module.exports = resolvers;
