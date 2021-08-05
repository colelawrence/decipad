import arc from '@architect/functions';
import { nanoid } from 'nanoid';
import {
  ID,
  URI,
  GraphqlContext,
  SharedWithUserRecord,
  PermissionRecord,
  SharedResource,
  SharedWith,
  SharedWithRoleRecord,
  Resource,
  PageInput,
  PagedResult,
  PermissionType,
} from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { create as createResourcePermission } from '@decipad/services/permissions';
import { create as createUser } from '@decipad/services/users';
import { auth as authConfig, app as appConfig } from '@decipad/config';
import paginate from '../utils/paginate';
import timestamp from '../utils/timestamp';
import { requireUser, check } from '../authorization';

const { urlBase } = appConfig();
const { inviteExpirationSeconds } = authConfig();

async function checkAdminAccessToResource(
  resource: URI,
  context: GraphqlContext
) {
  return check(resource, context, 'ADMIN');
}

function resourcePermissionToSharedResource(
  resourcePermission: PermissionRecord
): SharedResource {
  return {
    gqlType: 'SharedResource',
    resource: resourcePermission.resource_uri,
    permission: resourcePermission.type,
    canComment: resourcePermission.can_comment,
  };
}

function parseResource(resource: URI): Resource {
  const parts = resource.split('/');
  return {
    type: parts[1],
    id: parts.splice(2).join('/'),
  };
}

const resolvers = {
  Query: {
    async resourceSharedWith(
      _: unknown,
      { resource }: { resource: string },
      context: GraphqlContext
    ): Promise<SharedWith> {
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
        id: invite.id,
        email: invite.email as string,
      }));

      return {
        users,
        roles,
        pendingInvitations,
      };
    },

    async resourcesSharedWithMe(
      _: unknown,
      { page, resourceType }: { page: PageInput; resourceType: string },
      context: GraphqlContext
    ): Promise<PagedResult<SharedResource>> {
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

      return paginate<PermissionRecord, SharedResource>(
        data.permissions,
        q,
        page,
        resourcePermissionToSharedResource
      );
    },
  },

  Mutation: {
    async shareWithRole(
      _: unknown,
      {
        resource,
        roleId,
        permissionType,
        canComment,
      }: {
        resource: URI;
        roleId: ID;
        permissionType: PermissionType;
        canComment: boolean;
      },
      context: GraphqlContext
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
      _: unknown,
      {
        resource,
        userId,
        permissionType,
        canComment,
      }: {
        resource: URI;
        userId: ID;
        permissionType: PermissionType;
        canComment: boolean;
      },
      context: GraphqlContext
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
      _: unknown,
      {
        resource,
        resourceName,
        email,
        permissionType,
        canComment,
      }: {
        resource: URI;
        resourceName: string;
        email: string;
        permissionType: PermissionType;
        canComment: boolean;
      },
      context: GraphqlContext
    ) {
      const actingUser = await checkAdminAccessToResource(resource, context);

      const data = await tables();
      const emailKeyId = `email:${email}`;
      const emailKey = await data.userkeys.get({ id: emailKeyId });
      if (emailKey) {
        resolvers.Mutation.shareWithUser(
          _,
          {
            resource,
            userId: emailKey.user_id,
            permissionType,
            canComment,
          },
          context
        );
        return;
      }

      const newUser = await createUser({
        name: email,
        email,
      });

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
        expires_at: timestamp() + inviteExpirationSeconds,
      };
      await data.invites.create(newInvite);

      const inviteAcceptLink = `${urlBase}/api/invites/${newInvite.id}/accept`;
      await arc.queues.publish({
        name: 'sendemail',
        payload: {
          template: 'generic-invite',
          from: actingUser,
          to: newUser,
          resource,
          inviteAcceptLink,
          resourceName,
        },
      });
    },

    async unShareWithRole(
      _: unknown,
      { resource, roleId }: { resource: URI; roleId: ID },
      context: GraphqlContext
    ) {
      await checkAdminAccessToResource(resource, context);
      const data = await tables();
      await data.permissions.delete({
        id: `/users/null/roles/${roleId}${resource}`,
      });
    },

    async unShareWithUser(
      _: unknown,
      { resource, userId }: { resource: URI; userId: ID },
      context: GraphqlContext
    ) {
      await checkAdminAccessToResource(resource, context);
      const data = await tables();
      await data.permissions.delete({
        id: `/users/${userId}/roles/null${resource}`,
      });
    },
  },

  SharedWithUser: {
    async user(sharedWithUser: SharedWithUserRecord) {
      const data = await tables();
      return data.users.get({ id: sharedWithUser.user_id });
    },
  },

  SharedWithRole: {
    async role(sharedWithRole: SharedWithRoleRecord) {
      const data = await tables();
      return data.workspaceroles.get({ id: sharedWithRole.role_id });
    },
  },
};

export default resolvers;
