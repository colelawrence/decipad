import {
  GraphqlContext,
  ID,
  PadInput,
  PadRecord,
  PageInput,
  RoleRecord,
  Section,
  SectionRecord,
  User,
  WorkspaceRecord,
  PagedResult,
} from '@decipad/backendtypes';
import Resource from '@decipad/graphqlresource';
import { subscribe } from '@decipad/services/pubsub';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import { timestamp } from '@decipad/services/utils';
import assert from 'assert';
import {
  getNotebookInitialState,
  getNotebooksSharedWith,
  getWorkspaceNotebooks,
} from '@decipad/services/notebooks';
import { nanoid } from 'nanoid';
import {
  isAuthenticatedAndAuthorized,
  isAuthorized,
  loadUser,
  requireUser,
} from '../authorization';
import { accessTokenFor } from '../utils/accessTokenFor';
import { createOrUpdateSnapshot, getSnapshots } from './createOrUpdateSnapshot';
import { duplicatePad } from './duplicatePad';
import { importPad } from './importPad';
import { setPadPublic } from './setPadPublic';
import { movePad } from './movePad';

const padResource = Resource({
  resourceTypeName: 'pads',
  humanName: 'notebook',
  dataTable: async () => (await tables()).pads,
  toGraphql: (d) => ({
    ...d,
    createdAt: d.createdAt != null ? d.createdAt * 1000 : undefined,
  }),
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
    status: pad.status,
    archived: pad.archived,
    workspace_id: workspaceId,
    section_id: pad.section_id,
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
    async getPadById(
      _: unknown,
      params: { id: ID; snapshotName?: string },
      context: GraphqlContext
    ) {
      // So we can set `initialState` to be the last published snapshot.
      context.snapshotName = params.snapshotName;
      return padResource.getById(_, params, context);
    },

    async pads(
      _: unknown,
      { page, workspaceId }: { page: PageInput; workspaceId: ID },
      context: GraphqlContext
    ): Promise<PagedResult<PadRecord>> {
      const resource = `/workspaces/${workspaceId}`;
      if (await isAuthorized(resource, context, 'READ')) {
        return getWorkspaceNotebooks({
          user: loadUser(context),
          workspaceId,
          page,
        });
      }
      return {
        items: [],
        count: 0,
        hasNextPage: false,
      };
    },

    async padsSharedWithMe(
      _: unknown,
      { page }: { page: PageInput },
      context: GraphqlContext
    ) {
      return getNotebooksSharedWith({
        user: requireUser(context),
        page,
      });
    },
  },

  Mutation: {
    async createPad(
      _: unknown,
      opts: { workspaceId: ID; pad: PadInput; sectionId: ID },
      context: GraphqlContext
    ) {
      const resource = `/workspaces/${opts.workspaceId}`;
      await isAuthenticatedAndAuthorized(resource, context, 'WRITE');

      const notebook = opts.pad;

      if (opts.sectionId) {
        notebook.section_id = opts.sectionId;
      }

      const newPad = await padResource.create(
        _,
        { workspaceId: opts.workspaceId, pad: notebook },
        context
      );

      return newPad;
    },
    updatePad: padResource.update,
    removePad: padResource.remove,
    sharePadWithRole: padResource.shareWithRole,
    unsharePadWithRole: padResource.unshareWithRole,
    sharePadWithUser: padResource.shareWithUser,
    unsharePadWithUser: padResource.unshareWithUser,
    sharePadWithEmail: padResource.shareWithEmail,
    sharePadWithSecret: padResource.shareWithSecret,
    unshareNotebookWithSecret: padResource.unshareWithSecret,

    duplicatePad,
    setPadPublic,
    createOrUpdateSnapshot,
    movePad,
    importPad: async (
      parent: unknown,
      args: { workspaceId: ID; source: string },
      context: GraphqlContext
    ) => padResource.toGraphql(await importPad(parent, args, context)),
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

    async workspace(
      pad: PadRecord,
      _: unknown,
      context: GraphqlContext
    ): Promise<WorkspaceRecord | undefined> {
      const workspaceResource = `/workspaces/${pad.workspace_id}`;
      if (!(await isAuthorized(workspaceResource, context, 'READ'))) {
        return undefined;
      }
      const data = await tables();
      return data.workspaces.get({ id: pad.workspace_id });
    },

    async section(
      pad: PadRecord,
      _: unknown,
      context: GraphqlContext
    ): Promise<SectionRecord | undefined> {
      if (!pad.section_id) {
        return;
      }
      const workspaceResource = `/workspaces/${pad.workspace_id}`;
      if (!(await isAuthorized(workspaceResource, context, 'READ'))) {
        return undefined;
      }
      const data = await tables();
      return data.sections.get({ id: pad.section_id });
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
        )}?doc=${encodeURIComponent(pad.id)}&protocol=2`,
        token: await accessTokenFor(context.event, 'pubsub'),
      };
    },

    async initialState(
      pad: PadRecord,
      params: unknown,
      context: GraphqlContext
    ) {
      const permissionType = await padResource.myPermissionType(
        pad,
        params,
        context
      );
      const snapshotName =
        (permissionType == null || permissionType === 'READ') &&
        !context.snapshotName
          ? 'Published 1'
          : context.snapshotName;
      const initialState = await getNotebookInitialState(pad.id, snapshotName);
      return Buffer.from(initialState).toString('base64');
    },

    async snapshots(pad: PadRecord) {
      return getSnapshots({
        notebookId: pad.id,
      });
    },
  },

  /* eslint-disable camelcase */

  RoleAccess: {
    async role({ role_id }: { role_id: ID }): Promise<RoleRecord | undefined> {
      const data = await tables();
      return data.workspaceroles.get({ id: role_id });
    },
  },

  Section: {
    async pads(
      section: Section,
      _: unknown,
      context: GraphqlContext
    ): Promise<PadRecord[]> {
      const resource = `/workspaces/${section.workspace_id}`;
      await isAuthenticatedAndAuthorized(resource, context, 'READ');
      const data = await tables();

      const query = {
        IndexName: 'bySection',
        KeyConditionExpression: 'section_id = :section_id',
        ExpressionAttributeValues: {
          ':section_id': section.id,
        },
      };

      const padIds = (await data.pads.query(query)).Items.map((e) => e.id);
      return data.pads.batchGet(padIds);
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
