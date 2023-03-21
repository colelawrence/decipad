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
import { subscribe } from '@decipad/services/pubsub';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import assert from 'assert';
import {
  getNotebookInitialState,
  getNotebooksSharedWith,
  getWorkspaceNotebooks,
} from '@decipad/services/notebooks';
import { resource } from '@decipad/backend-resources';
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
import { padResource } from './padResource';

const workspaces = resource('workspace');

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
      const workspaceResource = `/workspaces/${workspaceId}`;
      if (await isAuthorized(workspaceResource, context, 'READ')) {
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
      const workspaceResource = `/workspaces/${opts.workspaceId}`;
      await isAuthenticatedAndAuthorized(workspaceResource, context, 'WRITE');

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
      await workspaces.expectAuthorizedForGraphql({
        context,
        recordId: section.workspace_id,
        minimumPermissionType: 'READ',
      });
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
