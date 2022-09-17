import {
  GraphqlContext,
  ID,
  Pad,
  PadInput,
  PadRecord,
  PageInput,
  RoleRecord,
  User,
  WorkspaceRecord,
} from '@decipad/backendtypes';
import Resource from '@decipad/graphqlresource';
import {
  create as createPad2,
  duplicate as duplicateSharedDoc,
  importDoc,
  getNotebooks,
} from 'libs/services/src/notebooks';
import { subscribe } from '@decipad/services/pubsub';
import tables from '@decipad/tables';
import { getDefined, identity } from '@decipad/utils';
import { UserInputError } from 'apollo-server-lambda';
import assert from 'assert';
import { nanoid } from 'nanoid';
import {
  isAuthenticatedAndAuthorized,
  loadUser,
  requireUser,
} from '../authorization';
import timestamp from '../utils/timestamp';
import { accessTokenFor } from '../utils/accessTokenFor';

const padResource = Resource({
  resourceTypeName: 'pads',
  humanName: 'notebook',
  dataTable: async () => (await tables()).pads,
  toGraphql: identity,
  isPublic: (d: PadRecord) => Boolean(d.isPublic),

  newRecordFrom: ({
    workspaceId,
    pad,
  }: {
    workspaceId: ID;
    pad: PadInput;
  }) => ({
    id: nanoid(),
    name: pad.name,
    icon: pad.icon,
    workspace_id: workspaceId,
    createdAt: timestamp(),
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
      return getNotebooks({
        user: loadUser(context),
        workspaceId,
        page,
      });
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
    unshareNotebookWithSecret: padResource.unshareWithSecret,

    async duplicatePad(
      _: unknown,
      {
        id,
        targetWorkspace,
        document,
      }: { id: ID; targetWorkspace?: string; document?: string },
      context: GraphqlContext
    ): Promise<Pad> {
      const resource = `/pads/${id}`;
      const data = await tables();
      const previousPad = await data.pads.get({ id });

      if (!previousPad) {
        throw new UserInputError('No such pad');
      }

      if (!previousPad.isPublic) {
        await isAuthenticatedAndAuthorized(resource, context, 'READ');
      }

      previousPad.name = `Copy of ${previousPad.name}`;

      const workspaceId = targetWorkspace || previousPad.workspace_id;

      const workspaceResource = `/workspaces/${workspaceId}`;
      const user = await isAuthenticatedAndAuthorized(
        workspaceResource,
        context,
        'WRITE'
      );

      const clonedPad = await createPad2(workspaceId, previousPad, user);
      if (document) {
        return importDoc({
          workspaceId,
          source: document,
          user,
          pad: clonedPad,
        });
      }
      await duplicateSharedDoc(id, clonedPad.id, previousPad.name);
      return clonedPad;
    },

    async setPadPublic(
      _: unknown,
      { id, isPublic }: { id: ID; isPublic: boolean },
      context: GraphqlContext
    ): Promise<Pad> {
      const resource = `/pads/${id}`;
      await isAuthenticatedAndAuthorized(resource, context, 'ADMIN');
      const data = await tables();
      const pad = await data.pads.get({ id });
      if (!pad) {
        throw new UserInputError('No such pad');
      }
      pad.isPublic = isPublic;
      await data.pads.put(pad);
      return pad;
    },

    async importPad(
      _: unknown,
      { workspaceId, source }: { workspaceId: ID; source: string },
      context: GraphqlContext
    ): Promise<Pad> {
      const workspaceResource = `/workspaces/${workspaceId}`;
      const user = await isAuthenticatedAndAuthorized(
        workspaceResource,
        context,
        'WRITE'
      );

      return importDoc({ workspaceId, source, user });
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
    myPermissionType: async (
      parent: PadRecord,
      params: unknown,
      context: GraphqlContext
    ) => {
      const permissionType = await padResource.myPermissionType(
        parent,
        params,
        context
      );
      if (permissionType == null && parent.isPublic) {
        return 'READ';
      }
      return permissionType;
    },

    async workspace(pad: PadRecord): Promise<WorkspaceRecord | undefined> {
      const data = await tables();
      return data.workspaces.get({ id: pad.workspace_id });
    },

    async padConnectionParams(
      pad: PadRecord,
      __: unknown,
      context: GraphqlContext
    ) {
      return {
        url: `${getDefined(
          process.env.ARC_WSS_URL,
          'need ARC_WSS_URL environment variable to be defined'
        )}?doc=${encodeURIComponent(pad.id)}`,
        token: await accessTokenFor(context.event, 'pubsub'),
      };
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
