/* eslint-disable @typescript-eslint/no-explicit-any */
import { badRequest, unauthorized, internal, notFound } from '@hapi/boom';
import { Doc as YDoc, applyUpdate } from 'yjs';
import { DynamoDbQuery, PadRecord } from '@decipad/backendtypes';
import tables, { paginate } from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import {
  getNotebooksSharedWith,
  getWorkspaceNotebooks,
} from '@decipad/services/notebooks';
import { resource } from '@decipad/backend-resources';
import { toSlateDoc } from '@decipad/slate-yjs';
import { searchTemplates } from '@decipad/backend-search';
import { getNotebookInitialState } from '@decipad/backend-notebook-content';
import {
  isAuthenticatedAndAuthorized,
  isAuthorized,
  isSuperAdmin,
  requireUser,
} from '../authorization';
import { accessTokenFor } from '../utils/accessTokenFor';
import {
  createOrUpdateSnapshot,
  createSnapshot,
  getSnapshots,
} from './snapshots';
import { duplicatePad } from './duplicatePad';
import { importPad } from './importPad';
import { setPadPublic } from './setPadPublic';
import { movePad } from './movePad';
import { padResource } from './padResource';
import { maximumPermissionIn } from 'libs/services/src/authorization/maximum-permission';
import { notebook } from 'libs/backend-resources/src/resources';
import {
  Pad,
  PagedPadResult,
  PermissionType,
  Resolvers,
  Section,
  User,
  Workspace,
} from '@decipad/graphqlserver-types';
import { claimNotebook } from './claimNotebook';
import { PublishedVersionName } from '@decipad/interfaces';

const MAX_INITIAL_STATE_PAYLOAD_SIZE = 5 * 1000 * 1000; // 5MB

const workspaces = resource('workspace');

const resolvers: Resolvers = {
  Query: {
    async getPadById(_, params, context) {
      // So we can set `initialState` to be the last published snapshot.
      if (params.snapshotName) {
        context.snapshotName = params.snapshotName;
      }

      const pad = await padResource.getById(_, params, context);
      if (pad && pad.banned) {
        throw notFound();
      }
      return pad;
    },

    async pads(_, { page, workspaceId }, context) {
      const workspaceResource = `/workspaces/${workspaceId}`;
      if (await isAuthorized(workspaceResource, context, 'READ')) {
        return (await getWorkspaceNotebooks({
          workspaceId,
          page,
        })) as PagedPadResult;
      }
      return {
        items: [],
        count: 0,
        hasNextPage: false,
      };
    },

    async padsSharedWithMe(_, { page }, context) {
      return (await getNotebooksSharedWith({
        user: requireUser(context) as User,
        page,
      })) as PagedPadResult;
    },

    async searchTemplates(_, { query, page }, context) {
      requireUser(context);

      const { maxItems, cursor: cursorString = '0' } = page;
      const cursor = parseInt(cursorString as string, 10);
      const results = await searchTemplates(query, {
        startIndex: cursor,
        maxResults: maxItems + 1,
      });

      const userResultSize =
        results.length > maxItems ? maxItems : results.length;

      return {
        cursor: String(cursor + results.length),
        hasNextPage: userResultSize < results.length,
        count: userResultSize,
        items: results
          .slice(0, userResultSize)
          .map((r) => r.notebook) as Array<Pad>,
      };
    },

    async publiclyHighlightedPads(_, { page }) {
      // TODO: Move into helper function

      const data = await tables();
      const PUBLICLY_HIGHLIGHTED = 'highlighted';

      const query: DynamoDbQuery = {
        IndexName: 'bySnapshotName',
        KeyConditionExpression: 'snapshotName = :snapshotName',
        ExpressionAttributeValues: {
          ':snapshotName': PUBLICLY_HIGHLIGHTED,
        },
      };

      return paginate(data.docsyncsnapshots, query, page);
    },
  },

  Mutation: {
    async createPad(_, opts, context) {
      const workspaceResource = `/workspaces/${opts.workspaceId}`;
      await isAuthenticatedAndAuthorized(workspaceResource, context, 'WRITE');

      const { pad } = opts;

      if (opts.sectionId) {
        pad.section_id = opts.sectionId;
      }

      return padResource.create(
        _,
        { workspaceId: opts.workspaceId, pad },
        context
      );
    },
    async updatePad(parent, { id, pad }, context) {
      if (pad.isTemplate && !(await isSuperAdmin(context))) {
        throw unauthorized();
      }
      return padResource.update(parent, { id, pad }, context);
    },
    removePad: padResource.remove,
    sharePadWithRole: padResource.shareWithRole,
    unsharePadWithRole: padResource.unshareWithRole,
    sharePadWithUser: padResource.shareWithUser,
    unsharePadWithUser: padResource.unshareWithUser,
    sharePadWithEmail: padResource.shareWithEmail,
    sharePadWithSecret: padResource.shareWithSecret,
    // TODO: uncomment?
    // Not being used by frontend, maybe we deprecate secrets.
    // unshareNotebookWithSecret: padResource.unshareWithSecret,

    duplicatePad,
    setPadPublic,
    createOrUpdateSnapshot,
    createSnapshot,
    movePad,
    importPad: async (parent, args, context) =>
      padResource.toGraphql(await importPad(parent, args, context)),

    async claimNotebook(_, { notebookId }, context) {
      if (context.user?.id == null) {
        throw badRequest('no user');
      }

      const data = await tables();

      const toClaimNotebook = await data.pads.get({ id: notebookId });
      if (toClaimNotebook == null || toClaimNotebook.gist !== 'ai') {
        throw badRequest('Bad notebook');
      }

      await claimNotebook(context.user.id, notebookId);

      // We refetch the notebook to get an updated version
      // After our changes in `claimNotebook`.
      const modifiedPad = await padResource.getById(
        _,
        { id: toClaimNotebook.id },
        context
      );

      if (modifiedPad == null) {
        throw internal('Could not get notebook');
      }

      return modifiedPad;
    },
  },

  Pad: {
    access: padResource.access,
    myPermissionType: async (parent, params, context) => {
      const notebookPermission = await padResource.myPermissionType(
        parent,
        params,
        context
      );

      const workspaceRes = getDefined(notebook.parentResourceUriFromRecord)(
        parent as PadRecord
      );
      const workspacePermission =
        workspaceRes && (await isAuthorized(workspaceRes, context, 'READ'));

      const maxPermission = maximumPermissionIn(
        [notebookPermission, workspacePermission].filter(
          Boolean
        ) as Array<PermissionType>
      );

      // allow the user to have read permission if the notebook is public
      const effectivePermission =
        maxPermission ??
        (parent.isPublic
          ? (parent as PadRecord).isPublicWritable
            ? 'WRITE'
            : 'READ'
          : undefined);

      context.readingModePermission = effectivePermission === 'READ';
      return effectivePermission;
    },

    async workspace(pad, _, context) {
      const data = await tables();

      const workspaceResource = getDefined(
        notebook.parentResourceUriFromRecord
      )(pad as PadRecord);

      if (
        workspaceResource &&
        pad.workspaceId &&
        (await isAuthorized(workspaceResource, context, 'READ'))
      ) {
        return (await data.workspaces.get({
          id: pad.workspaceId,
        })) as Workspace;
      }
      // small hack to avoid setting the name of the workspace as nullable and changing several files
      return { id: pad.workspaceId ?? 'fakeid', name: '' } as Workspace;
    },

    async section(pad, _, context) {
      if (!pad.sectionId) {
        return undefined;
      }
      const workspaceResource = `/workspaces/${pad.workspaceId}`;
      if (!(await isAuthorized(workspaceResource, context, 'READ'))) {
        return undefined;
      }
      const data = await tables();
      return (await data.sections.get({ id: pad.sectionId })) as Section;
    },

    async padConnectionParams(pad, __, context) {
      return {
        url: `${getDefined(
          process.env.ARC_WSS_URL,
          'need ARC_WSS_URL environment variable to be defined'
        )}?doc=${encodeURIComponent(pad.id)}&protocol=2`,
        token: await accessTokenFor(context.event, 'pubsub'),
      };
    },

    async initialState(pad, params, context) {
      const permissionType = await padResource.myPermissionType(
        pad,
        params,
        context
      );

      // TODO: Refactor
      // Move this into own helper function.
      // + Add `gist` field to graphql
      if (pad.workspaceId == null) {
        const initialState = await getNotebookInitialState(pad.id);
        if (initialState.length >= MAX_INITIAL_STATE_PAYLOAD_SIZE) {
          return null;
        }
        return Buffer.from(initialState).toString('base64');
      }

      // TODO: Refactor before merge.
      // if you see this in code review, dont approve :)

      const snapshotName =
        (permissionType == null || permissionType === 'READ') &&
        !context.snapshotName
          ? PublishedVersionName.Published
          : context.snapshotName;
      const initialState = await getNotebookInitialState(pad.id, snapshotName);
      if (initialState.length >= MAX_INITIAL_STATE_PAYLOAD_SIZE) {
        return null;
      }
      return Buffer.from(initialState).toString('base64');
    },

    async snapshots(pad) {
      return getSnapshots({
        notebookId: pad.id,
      });
    },

    async document(pad) {
      const initialState = await getNotebookInitialState(pad.id);
      const doc = new YDoc();
      applyUpdate(doc, initialState);

      return JSON.stringify({ children: toSlateDoc(doc.getArray()) });
    },
  },

  /* eslint-disable camelcase */

  Section: {
    async pads(section, _, context) {
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
      return (await data.pads.batchGet(padIds)) as Array<Pad>;
    },
  },

  UserAccess: {
    async user({ userId }) {
      const data = await tables();

      if (!userId) {
        return undefined;
      }

      const dbUsers = await data.users.get({ id: userId });

      if (!dbUsers) {
        return undefined;
      }

      return {
        ...dbUsers,
        id: userId,
        name: dbUsers.name,
        email: getDefined(dbUsers.email),
        image: dbUsers?.email ?? undefined,
      } satisfies User;
    },
  },
};

export default resolvers;
