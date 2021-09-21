import assert from 'assert';
import { nanoid } from 'nanoid';
import { UserInputError } from 'apollo-server-lambda';
import {
  DocSyncRecord,
  ID,
  GraphqlContext,
  PageInput,
  PermissionRecord,
  PadInput,
  Pad,
  PadRecord,
  WorkspaceRecord,
  RoleRecord,
  User,
} from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { subscribe } from '@decipad/services/pubsub';
import { create as createPad2 } from '@decipad/services/pads';
import { duplicate as duplicatePadContent } from '@decipad/services/blobs/pads';
import Resource from '@decipad/graphqlresource';
import { requireUser, isAuthenticatedAndAuthorized } from '../authorization';
import paginate from '../utils/paginate';

const padResource = Resource({
  resourceTypeName: 'pads',
  humanName: 'notebook',
  pubSubChangeTopic: 'padsChanged',
  dataTable: async () => (await tables()).pads,
  toGraphql: (d: PadRecord) => d,

  newRecordFrom: ({
    workspaceId,
    pad,
  }: {
    workspaceId: ID;
    pad: PadInput;
  }) => ({
    id: nanoid(),
    name: pad.name,
    workspace_id: workspaceId,
  }),

  updateRecordFrom: (record: PadRecord, { pad }: { pad: PadInput }) => {
    return {
      ...record,
      ...pad,
    };
  },

  beforeCreate: async (
    { workspaceId }: { workspaceId: ID },
    context: GraphqlContext
  ) => {
    const workspaceResource = `/workspaces/${workspaceId}`;
    await isAuthenticatedAndAuthorized(workspaceResource, context, 'WRITE');
  },

  parentResourceUriFromCreateInput: ({ workspaceId }: { workspaceId: ID }) =>
    `/workspaces/${workspaceId}`,
  /* eslint-disable camelcase */
  parentResourceUriFromRecord: ({ workspace_id }: { workspace_id: ID }) =>
    /* eslint-disable camelcase */
    `/workspaces/${workspace_id}`,
});

const resolvers = {
  Query: {
    getPadById: padResource.getById,

    async pads(
      _: unknown,
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

      return paginate<PermissionRecord, PadRecord>(
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
    createPad: padResource.create,
    updatePad: padResource.update,
    removePad: padResource.remove,
    sharePadWithRole: padResource.shareWithRole,
    unsharePadWithRole: padResource.unshareWithRole,
    sharePadWithUser: padResource.shareWithUser,
    unsharePadWithUser: padResource.unshareWithUser,
    sharePadWithEmail: padResource.shareWithEmail,
    sharePadWithSecret: padResource.shareWithSecret,

    async duplicatePad(
      _: unknown,
      { id }: { id: ID },
      context: GraphqlContext
    ): Promise<Pad> {
      const resource = `/pads/${id}`;
      await isAuthenticatedAndAuthorized(resource, context, 'READ');

      const data = await tables();
      const previousPad = await data.pads.get({ id });

      if (!previousPad) {
        throw new UserInputError('No such pad');
      }

      previousPad.name = `Copy of ${previousPad.name}`;

      const workspaceResource = `/workspaces/${previousPad.workspace_id}`;
      const user = await isAuthenticatedAndAuthorized(
        workspaceResource,
        context,
        'WRITE'
      );
      const clonedPad = await createPad2(
        previousPad.workspace_id,
        previousPad,
        user
      );

      const oldId = `/pads/${id}/content`;
      const oldDoc = await data.docsync.get({ id: oldId });
      if (oldDoc) {
        const newId = `/pads/${clonedPad.id}/content`;
        await data.docsync.withLock(
          newId,
          async (docSync: DocSyncRecord = { id: newId, _version: 0 }) => {
            // eslint-disable-next-line no-underscore-dangle
            await duplicatePadContent(oldDoc.id, oldDoc._version, newId);
            return docSync;
          }
        );
      }

      return clonedPad;
    },
  },

  Subscription: {
    padsChanged: {
      async subscribe(
        _: unknown,
        { workspaceId }: { workspaceId: ID },
        context: GraphqlContext
      ) {
        const user = requireUser(context);
        assert(context.subscriptionId, 'no subscriptionId in context');
        assert(context.connectionId, 'no connectionId in context');
        return subscribe({
          subscriptionId: context.subscriptionId,
          connectionId: context.connectionId,
          user,
          type: 'padsChanged',
          filter: JSON.stringify({ workspace_id: workspaceId }),
        });
      },
    },
  },

  Pad: {
    access: padResource.access,

    async workspace(pad: PadRecord): Promise<WorkspaceRecord | undefined> {
      const data = await tables();
      return data.workspaces.get({ id: pad.workspace_id });
    },
  },

  /* eslint-disable camelcase */

  RoleAccess: {
    async role({ role_id }: { role_id: ID }): Promise<RoleRecord | undefined> {
      const data = await tables();
      return data.workspaceroles.get({ id: role_id });
    },
  },

  UserAccess: {
    async user({ user_id }: { user_id: ID }): Promise<User | undefined> {
      const data = await tables();
      return data.users.get({ id: user_id });
    },
  },
};

export default resolvers;
