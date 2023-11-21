import stringify from 'json-stringify-safe';
import { GraphqlContext, ID, Pad } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import {
  create as createPad2,
  importNotebookContent,
  duplicateNotebookAttachments,
  snapshot,
  getStoredSnapshot,
} from '@decipad/services/notebooks';
import { UserInputError, ForbiddenError } from 'apollo-server-lambda';
import { resource } from '@decipad/backend-resources';
import { isAuthorized, loadUser } from '../authorization';
import { isLocalDev } from '@decipad/initial-workspace';
import { byAsc } from '@decipad/utils';
import { ELEMENT_TITLE, RootDocument } from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import Boom from '@hapi/boom';

const notebooks = resource('notebook');
const PUBLISHED_SNAPSHOT_NAME = 'Published 1';

async function getNotebookContent(
  userId: string,
  notebookId: string
): Promise<RootDocument> {
  const data = await tables();

  /**
   * Lets check the user actually has permissions for this notebook
   * Or if the notebook is just published.
   */
  const notebookPermission = (
    await data.permissions.query({
      IndexName: 'byUserId',
      KeyConditionExpression:
        'user_id = :user_id and resource_type = :resource_type',
      FilterExpression: 'resource_id = :resource_id',
      ExpressionAttributeValues: {
        ':user_id': userId,
        ':resource_type': 'pads',
        ':resource_id': notebookId,
      },
    })
  ).Items;

  // Can the user duplicate the original notebook
  // Or should they just be able to duplicate the
  // published version.
  const isUserPermitted = notebookPermission.length > 0;

  if (isUserPermitted) {
    const doc = (await snapshot(notebookId)).value;
    if (!doc.children[0]) {
      doc.children[0] = {
        type: ELEMENT_TITLE,
        id: nanoid(),
        children: [{ text: '' }],
      };
    }
    return doc;
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

  return publishedDoc.doc;
}

export const duplicatePad = async (
  _: unknown,
  {
    id,
    document: _document,
    targetWorkspace,
  }: { id: ID; document?: string; targetWorkspace?: string },
  context: GraphqlContext
): Promise<Pad> => {
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
        }

        workspaceRecords.push(ws);
      }
      workspaceId = workspaceRecords.sort(byAsc('name'))[0].id;
    }
  }

  if (!workspaceId) {
    throw new ForbiddenError('Could not authenticate.');
  }
  await notebooks.expectAuthorizedForGraphql({
    context,
    recordId: id,
    minimumPermissionType: 'READ',
  });

  const newName = `Copy of ${previousPad.name}`;

  previousPad.name = newName;
  previousPad.isPublic = false;
  previousPad.archived = false;

  const clonedPad = await createPad2(workspaceId, previousPad, user);

  // TODO: If duplicating a published notebook, we shouldn't duplicate
  // ALL attachments, only the ones saved before the time of publishing.
  const replaceList = await duplicateNotebookAttachments(
    previousPad.id,
    clonedPad.id
  );

  const doc = await getNotebookContent(user.id, id);

  doc.children[0].children = [{ text: newName }];
  const document = _document != null ? _document : stringify(doc);

  return importNotebookContent({
    workspaceId,
    source: document,
    user,
    pad: clonedPad,
    replaceList,
  });
};
