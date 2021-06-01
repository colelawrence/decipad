'use strict';

const arc = require('@architect/functions');
const { nanoid } = require('nanoid');
const tables = require('../../tables');
const { requireUser, check } = require('../authorization');
const createResourcePermission = require('../../resource-permissions/create');
const paginate = require('../utils/paginate');

const resolvers = {
  Query: {
    async resourceSharedWith(_, { resource }, context) {
      const user = await checkAdminAccessToResource(resource, context);
      const data = await tables();

      // Get users

      const userPermissions = (
        await data.permissions.query({
          IndexName: 'byResource',
          KeyConditionExpression: 'resource_uri = :resource_uri',
          FilterExpression: 'user_id <> :null_id and role_id = :null_id',
          ExpressionAttributeValues: {
            ':resource_uri': resource,
            ':null_id': 'null',
          },
        })
      ).Items;

      const users = userPermissions
        .filter((p) => p.user_id !== user.id)
        .map((p) => ({
          user_id: p.user_id,
          permissionType: p.type,
          canComment: p.can_comment,
        }));

      // Get roles
      const rolePermissions = (
        await data.permissions.query({
          IndexName: 'byResource',
          KeyConditionExpression: 'resource_uri = :resource_uri',
          FilterExpression: 'user_id = :null_id and role_id <> :null_id',
          ExpressionAttributeValues: {
            ':resource_uri': resource,
            ':null_id': 'null',
          },
        })
      ).Items;

      const roles = rolePermissions.map((p) => ({
        role_id: p.role_id,
        permissionType: p.type,
        canComment: p.can_comment,
      }));

      // Get pending invitations

      const pendingInvitations = (
        await data.invites.query({
          IndexName: 'byResource',
          KeyConditionExpression: 'resource_uri = :resource_uri',
          ExpressionAttributeValues: {
            ':resource_uri': resource,
          },
        })
      ).Items.filter((invite) => !!invite.email).map((invite) => ({
        email: invite.email,
      }));

      return {
        users,
        roles,
        pendingInvitations,
      };
    },

    async resourcesSharedWithMe(_, { page, resourceType }, context) {
      const user = requireUser(context);
      const data = await tables();

      const q = {
        IndexName: 'byUserId',
        KeyConditionExpression:
          'user_id = :user_id and resource_type = :resource_type',
        ExpressionAttributeValues: {
          ':user_id': user.id,
          ':resource_type': resourceType,
        },
      };

      return await paginate(
        data.permissions,
        q,
        page,
        resourcePermissionToSharedResource
      );
    },
  },

  Mutation: {
    async shareWithRole(
      _,
      { resource, roleId, permissionType, canComment },
      context
    ) {
      const actorUser = await checkAdminAccessToResource(resource, context);

      await createResourcePermission({
        roleId,
        givenByUserId: actorUser.id,
        resourceUri: resource,
        type: permissionType,
        canComment,
      });
    },

    async shareWithUser(
      _,
      { resource, userId, permissionType, canComment },
      context
    ) {
      const actorUser = await checkAdminAccessToResource(resource, context);

      await createResourcePermission({
        userId,
        givenByUserId: actorUser.id,
        resourceUri: resource,
        type: permissionType,
        canComment,
      });
    },

    async inviteToShareWithEmail(
      _,
      { resource, resourceName, email, permissionType, canComment },
      context
    ) {
      const actingUser = await checkAdminAccessToResource(resource, context);

      const data = await tables();
      const emailKeyId = `email:${email}`;
      const emailKey = await data.userkeys.get({ id: emailKeyId });
      if (emailKey) {
        return await resolvers.Mutation.shareWithUser(
          _,
          {
            resource,
            userId: emailKey.user_id,
            permissionType,
            canComment,
          },
          context
        );
      }

      const newUser = {
        id: nanoid(),
        name: '',
        last_login: null,
        email: email,
        secret: nanoid(),
      };
      await data.users.put(newUser);

      const newUserKey = {
        id: emailKeyId,
        user_id: newUser.id,
      };
      await data.userkeys.put(newUserKey);

      const parsedResource = parseResource(resource);
      const newInvite = {
        id: nanoid(),
        permission_id: `/users/${newUser.id}/roles/null${resource}`,
        resource_uri: resource,
        resource_type: parsedResource.type,
        resource_id: parsedResource.id,
        user_id: newUser.id,
        role_id: 'null',
        invited_by_user_id: actingUser.id,
        permission: permissionType,
        email,
        can_comment: canComment,
        expires_at:
          Math.round(Date.now() / 1000) +
          Number(process.env.DECI_INVITE_EXPIRATION_SECONDS || 86400),
      };
      await data.invites.put(newInvite);

      const inviteAcceptLink = `${process.env.DECI_APP_URL_BASE}/api/invites/${newInvite.id}/accept`;
      await arc.queues.publish({
        name: 'sendemail',
        payload: {
          template: 'generic-invite',
          from: actingUser,
          to: newUser,
          resource,
          inviteAcceptLink: inviteAcceptLink,
          resourceName,
        },
      });
    },

    async unShareWithRole(_, { resource, roleId }, context) {
      await checkAdminAccessToResource(resource, context);
      const data = await tables();
      await data.permissions.delete({
        id: `/users/null/roles/${roleId}${resource}`,
      });
    },

    async unShareWithUser(_, { resource, userId }, context) {
      await checkAdminAccessToResource(resource, context);
      const data = await tables();
      await data.permissions.delete({
        id: `/users/${userId}/roles/null${resource}`,
      });
    },
  },

  SharedWithUser: {
    async user(sharedWithUser) {
      const data = await tables();
      return await data.users.get({ id: sharedWithUser.user_id });
    },
  },

  SharedWithRole: {
    async role(sharedWithRole) {
      const data = await tables();
      return await data.workspaceroles.get({ id: sharedWithRole.role_id });
    },
  },
};

async function checkAdminAccessToResource(resource, context) {
  return await check(resource, context, 'ADMIN');
}

function resourcePermissionToSharedResource(resourcePermission) {
  return {
    gqlType: 'SharedResource',
    resource: resourcePermission.resource_uri,
    permission: resourcePermission.type,
    canComment: resourcePermission.can_comment,
  };
}

function parseResource(resource) {
  const parts = resource.split('/');
  return {
    type: parts[1],
    id: parts.splice(2).join('/'),
  };
}

module.exports = resolvers;
