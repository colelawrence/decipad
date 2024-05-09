import stringify from 'json-stringify-safe';
import tables from '@decipad/tables';
import {
  create as createPad2,
  importNotebookContent,
  duplicateNotebookAttachments,
  snapshot,
  getStoredSnapshot,
  canPublicDuplicatePad,
  getPadAttachmentSize,
} from '@decipad/services/notebooks';
import { UserInputError, ForbiddenError } from 'apollo-server-lambda';
import { resource } from '@decipad/backend-resources';
import { isAuthorized, loadUser } from '../authorization';
import { isLocalDev } from '@decipad/initial-workspace';
import { byAsc } from '@decipad/utils';
import type { RootDocument } from '@decipad/editor-types';
import { ELEMENT_TITLE } from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import Boom from '@hapi/boom';
import { getNodeString } from '@udecode/plate-common';
import type {
  GraphqlContext,
  MutationResolvers,
} from '@decipad/graphqlserver-types';
import { padResource } from './padResource';
import { PublishedVersionName } from '@decipad/interfaces';
import { resourceusage } from '@decipad/services';
import { track } from '@decipad/backend-analytics';

const notebooks = resource('notebook');
const PUBLISHED_SNAPSHOT_NAME = PublishedVersionName.Published;

/**
 * Returns the document content and title
 * depending on whether we are duplicating a published notebook
 * or one we have access to.
 *
 * Duplicating from public notebooks means we only ever copy what
 * the published snapshot is, including title.
 */
async function getNotebookContent(
  notebookId: string,
  content: 'snapshot' | 'content'
): Promise<[RootDocument, string]> {
  if (content === 'content') {
    const doc = (await snapshot(notebookId)).value;
    if (!doc.children[0]) {
      doc.children[0] = {
        type: ELEMENT_TITLE,
        id: nanoid(),
        children: [{ text: '' }],
      };
    }
    return [doc, getNodeString(doc.children[0])];
  }

  const data = await tables();

  const notebook = await data.pads.get({ id: notebookId });
  if (notebook == null) {
    throw Boom.notAcceptable('Could not find this notebook.');
  }

  if (!notebook.isPublic) {
    throw Boom.forbidden('You do not have permission to duplica this notebook');
  }

  const publishedDoc = await getStoredSnapshot(
    notebookId,
    PUBLISHED_SNAPSHOT_NAME
  );

  if (!publishedDoc) {
    throw Boom.notAcceptable('Published snapshot is empty');
  }
  if (!publishedDoc.doc.children[0]) {
    publishedDoc.doc.children[0] = {
      type: ELEMENT_TITLE,
      id: nanoid(),
      children: [{ text: '' }],
    };
  }

  return [publishedDoc.doc, getNodeString(publishedDoc.doc.children[0])];
}

/**
 * Helper function, checks if user has `READ` permission on notebook
 * or if the notebook is public and can be duplicated
 */
async function canUserDuplicate(
  padId: string,
  context: GraphqlContext
): Promise<'snapshot' | 'content' | 'none'> {
  try {
    await notebooks.expectAuthorizedForGraphql({
      context,
      recordId: padId,
      minimumPermissionType: 'WRITE',
      ignorePadPublic: true,
    });
    return 'content';
  } catch (e) {
    try {
      // We cannot write to the notebook.
      // So we should be able to at least read it.

      await notebooks.expectAuthorizedForGraphql({
        context,
        recordId: padId,
        minimumPermissionType: 'READ',
        ignorePadPublic: true,
      });

      return 'snapshot';
    } catch (otherE) {
      return (await canPublicDuplicatePad(padId)) ? 'snapshot' : 'none';
    }
  }
}

export const duplicatePad: MutationResolvers['duplicatePad'] = async (
  _,
  { id, document: _document, targetWorkspace },
  context
) => {
  const user = loadUser(context);
  if (!user) {
    throw new ForbiddenError('Not signed in');
  }

  const data = await tables();
  const previousPad = await data.pads.get({ id });

  if (!previousPad) {
    throw new UserInputError('No such pad');
  }

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

  let workspaceId = '';
  if (targetWorkspace) {
    const workspaceResourceName = `/workspaces/${targetWorkspace}`;
    if (await isAuthorized(workspaceResourceName, context, 'WRITE')) {
      workspaceId = targetWorkspace;
    }
  } else {
    for (const permission of permissions) {
      // TODO should we use Promise.all?
      // eslint-disable-next-line no-await-in-loop
      const workspace = await data.workspaces.get({
        id: permission.resource_id,
      });

      const workspaceRecords = [];
      // Use the first created workspace as it's likely to be the user's main workspace
      if (workspace) {
        const { name: workspaceName } = workspace;
        const ws = { ...workspace };
        // for development purposes we want
        // to be able to have premium
        // and non premium workspaces
        if (isLocalDev() && workspaceName.includes('@n1n.co')) {
          ws.isPremium = true;

          if (ws.name.includes('team')) {
            ws.plan = 'team';
          } else if (ws.name.includes('enterprise')) {
            ws.plan = 'enterprise';
          } else {
            ws.plan = 'personal';
          }
        }

        workspaceRecords.push(ws);
      }
      workspaceId = workspaceRecords.sort(byAsc('name'))[0].id;
    }
  }

  if (!workspaceId) {
    throw new ForbiddenError('Could not authenticate.');
  }

  const isUserAllowedToDuplicate = await canUserDuplicate(id, context);

  if (isUserAllowedToDuplicate === 'none') {
    throw Boom.forbidden('You cannot duplicate this pad');
  }

  const padStorage = await getPadAttachmentSize(previousPad.id);
  const [usage, limit] = await Promise.all([
    resourceusage.storage.getUsage(workspaceId),
    resourceusage.storage.getLimit(workspaceId),
  ]);

  if (usage + padStorage > limit) {
    throw Boom.forbidden(
      'The attachments are too big to duplicate, free up some storage.'
    );
  }

  const [doc, name] = await getNotebookContent(id, isUserAllowedToDuplicate);

  const newName = `Copy of ${name}`;
  previousPad.name = newName;
  doc.children[0].children[0].text = newName;

  previousPad.isPublic = false;
  previousPad.archived = false;

  const clonedPad = await createPad2(workspaceId, previousPad, user);

  // TODO: If duplicating a published notebook, we shouldn't duplicate
  // ALL attachments, only the ones saved before the time of publishing.
  const [replaceList, storageUsed] = await duplicateNotebookAttachments(
    previousPad.id,
    clonedPad.id
  );

  await resourceusage.storage.updateWorkspaceAndUser({
    workspaceId,
    usage: { consumption: storageUsed, type: 'files' },
  });

  const document = _document != null ? _document : stringify(doc);

  const importedNotebook = await importNotebookContent({
    workspaceId,
    source: document,
    user,
    pad: clonedPad,
    replaceList,
  });

  await track(
    context.event,
    {
      userId: user.id,
      event: 'Notebook Duplicated',
      properties: {
        notebook_id: importedNotebook.id,
        original_notebookId: previousPad.id,
        analytics_source: 'backend',
      },
    },
    context
  );

  // Graphql types mismatch the DB types here.
  // But the mismatch happens because of nested properties
  // and are resolved using their own resolvers.
  return padResource.toGraphql(importedNotebook);
};
