import assert from 'assert';
import arc from '@architect/functions';
import { nanoid } from 'nanoid';
import { UserInputError } from 'apollo-server-lambda';
import tables from '../../tables';
import { requireUser, check } from '../authorization';
import createResourcePermission from '../../resource-permissions/create';
import removeAllPermissionsFor from '../../resource-permissions/remove-all-permissions-for';
import by from '../utils/by';
import { notifyAllWithAccessTo, subscribe } from '../../pubsub';
import paginate from '../utils/paginate';

const resolvers = {
  Query: {
    async pads(
      _: any,
      { page, workspaceId }: { page: PageInput; workspaceId: ID },
      context: GraphqlContext
    ) {
      const user = requireUser(context);
      const data = await tables();

      const query = {
        IndexName: 'byUserId',
        KeyConditionExpression:
          'user_id = :user_id and resource_type = :resource_type',
        FilterExpression: 'parent_resource_uri = :parent_resource_uri',
        ExpressionAttributeValues: {
          ':user_id': user.id,
          ':resource_type': 'pads',
          ':parent_resource_uri': `/workspaces/${workspaceId}`,
        },
      };

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

  Mutation: {
    async createPad(
      _: any,
      { workspaceId, pad }: { workspaceId: ID; pad: PadInput },
      context: GraphqlContext
    ): Promise<Pad> {
      const workspaceResource = `/workspaces/${workspaceId}`;
      const user = await check(workspaceResource, context, 'WRITE');

      const newPad = {
        id: nanoid(),
        name: pad.name,
        workspace_id: workspaceId,
      };

      const data = await tables();
      await data.pads.put(newPad);

      await createResourcePermission({
        resourceType: 'pads',
        resourceId: newPad.id,
        userId: user.id,
        type: 'ADMIN',
        givenByUserId: user.id,
        canComment: true,
        parentResourceUri: workspaceResource,
      });

      return newPad;
    },

    async updatePad(
      _: any,
      { id, pad }: { id: ID; pad: PadInput },
      context: GraphqlContext
    ): Promise<Pad> {
      const resource = `/pads/${id}`;
      await check(resource, context, 'WRITE');

      const data = await tables();
      const previousPad = await data.pads.get({ id });
      if (!previousPad) {
        throw new UserInputError('No such pad');
      }

      const changedPad = { ...previousPad, ...pad };
      await data.pads.put(changedPad);
      await notifyAllWithAccessTo(resource, 'padsChanged', {
        updated: [
          {
            id,
            workspace_id: previousPad.workspace_id,
            ...pad,
          },
        ],
      });

      return changedPad;
    },

    async removePad(_: any, { id }: { id: ID }, context: GraphqlContext) {
      const resource = `/pads/${id}`;
      await check(resource, context, 'ADMIN');

      await removeAllPermissionsFor(resource);
      const data = await tables();
      await data.pads.delete({ id });
    },

    async sharePadWithRole(
      _: any,
      {
        padId,
        roleId,
        permissionType,
        canComment,
      }: {
        padId: ID;
        roleId: ID;
        permissionType: PermissionType;
        canComment: boolean;
      },
      context: GraphqlContext
    ) {
      const resource = `/pads/${padId}`;
      const actorUser = await check(resource, context, 'ADMIN');

      const data = await tables();
      const pad = await data.pads.get({ id: padId });
      if (!pad) {
        throw new UserInputError('no such pad');
      }

      await createResourcePermission({
        roleId,
        givenByUserId: actorUser.id,
        resourceUri: resource,
        type: permissionType,
        canComment,
        parentResourceUri: `/workspaces/${pad.workspace_id}`,
      });
    },

    async unsharePadWithRole(
      _: any,
      { padId, roleId }: { padId: ID; roleId: ID },
      context: GraphqlContext
    ) {
      const resource = `/pads/${padId}`;
      await check(resource, context, 'ADMIN');

      const data = await tables();
      await data.permissions.delete({
        id: `/users/null/roles/${roleId}${resource}`,
      });
    },

    async sharePadWithUser(
      _: any,
      {
        padId,
        userId,
        permissionType,
        canComment,
      }: {
        padId: ID;
        userId: ID;
        permissionType: PermissionType;
        canComment: boolean;
      },
      context: GraphqlContext
    ) {
      const resource = `/pads/${padId}`;
      const actorUser = await check(resource, context, 'ADMIN');

      const data = await tables();
      const pad = await data.pads.get({ id: padId });
      if (!pad) {
        throw new UserInputError('no such pad');
      }

      await createResourcePermission({
        userId,
        givenByUserId: actorUser.id,
        resourceUri: resource,
        type: permissionType,
        canComment,
        parentResourceUri: `/workspaces/${pad.workspace_id}`,
      });
    },

    async unsharePadWithUser(
      _: any,
      { padId, userId }: { padId: ID; userId: ID },
      context: GraphqlContext
    ) {
      const resource = `/pads/${padId}`;
      await check(resource, context, 'ADMIN');
      const data = await tables();
      await data.permissions.delete({
        id: `/users/${userId}/roles/null${resource}`,
      });
    },

    async sharePadWithEmail(
      _: any,
      {
        padId,
        email,
        permissionType,
        canComment,
      }: {
        padId: ID;
        email: string;
        permissionType: PermissionType;
        canComment: boolean;
      },
      context: GraphqlContext
    ) {
      const resource = `/pads/${padId}`;
      const actingUser = await check(resource, context, 'ADMIN');
      const data = await tables();
      const pad = await data.pads.get({ id: padId });
      if (!pad) {
        throw new UserInputError('No such workspace');
      }

      const emailKeyId = `email:${email}`;
      const emailKey = await data.userkeys.get({ id: emailKeyId });
      if (emailKey) {
        return await resolvers.Mutation.sharePadWithUser(
          _,
          {
            padId,
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

      const newInvite = {
        id: nanoid(),
        permission_id: `/users/${newUser.id}/roles/null${resource}`,
        resource_uri: resource,
        resource_type: 'pads',
        resource_id: padId,
        user_id: newUser.id,
        role_id: 'null',
        invited_by_user_id: actingUser.id,
        permission: permissionType,
        email,
        can_comment: canComment,
        parent_resource_uri: `/workspaces/${pad.workspace_id}`,
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
          resourceName: pad.name,
        },
      });
    },
  },

  Subscription: {
    padsChanged: {
      async subscribe(
        _: any,
        { workspaceId }: { workspaceId: ID },
        context: GraphqlContext
      ) {
        const user = requireUser(context);
        assert(context.subscriptionId, 'no subscriptionId in context');
        assert(context.connectionId, 'no connectionId in context');
        return await subscribe({
          subscriptionId: context.subscriptionId!,
          connectionId: context.connectionId!,
          user,
          type: 'padsChanged',
          filter: JSON.stringify({ workspace_id: workspaceId }),
        });
      },
    },
  },

  Pad: {
    async access(pad: Pad): Promise<PadAccessRecord> {
      const resource = `/pads/${pad.id}`;
      const data = await tables();
      const permissions = (
        await data.permissions.query({
          IndexName: 'byResource',
          KeyConditionExpression: 'resource_uri = :resource_uri',
          ExpressionAttributeValues: {
            ':resource_uri': resource,
          },
        })
      ).Items;

      const roles = permissions
        .filter((p) => p.user_id === 'null')
        .map((p) => ({
          role_id: p.role_id,
          permission: p.type,
          canComment: p.can_comment,
        }));

      const users = permissions
        .filter((p) => p.role_id === 'null')
        .map((p) => ({
          user_id: p.user_id,
          permission: p.type,
          canComment: p.can_comment,
          createdAt: p.created_at,
        }))
        .sort(by('permission'));

      return {
        roles,
        users,
      };
    },

    async workspace(pad: PadRecord, _: any): Promise<Workspace> {
      const data = await tables();
      return await data.workspaces.get({ id: pad.workspace_id });
    },
  },

  RoleAccess: {
    async role({ role_id }: { role_id: ID }): Promise<RoleRecord | undefined> {
      const data = await tables();
      return await data.workspaceroles.get({ id: role_id });
    },
  },

  UserAccess: {
    async user({ user_id }: { user_id: ID }): Promise<User | undefined> {
      const data = await tables();
      return await data.users.get({ id: user_id });
    },
  },
};

export default resolvers;
