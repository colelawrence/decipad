import stringify from 'json-stringify-safe';
import { GraphqlContext, ID, Pad } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import {
  create as createPad2,
  importNotebookContent,
  duplicateNotebookAttachments,
  snapshot,
} from '@decipad/services/notebooks';
import { UserInputError, ForbiddenError } from 'apollo-server-lambda';
import { resource } from '@decipad/backend-resources';
import Boom from '@hapi/boom';
import { isAuthorized, loadUser } from '../authorization';
import { isLocalDev } from '@decipad/initial-workspace';
import { byAsc } from '@decipad/utils';

const notebooks = resource('notebook');

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

  const newName =
    workspaceId === previousPad.workspace_id
      ? `Copy of ${previousPad.name}`
      : previousPad.name;

  previousPad.name = newName;
  previousPad.isPublic = false;
  previousPad.archived = false;

  const clonedPad = await createPad2(workspaceId, previousPad, user);

  const replaceList = await duplicateNotebookAttachments(
    previousPad.id,
    clonedPad.id
  );

  const doc = (await snapshot(id)).value;
  if (!doc.children[0]) {
    throw Boom.notAcceptable('snapshot is empty');
  }
  // set new title
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
