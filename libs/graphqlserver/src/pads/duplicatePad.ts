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

const notebooks = resource('notebook');
const workspaces = resource('workspace');

export const duplicatePad = async (
  _: unknown,
  {
    id,
    targetWorkspace,
    document: _document,
  }: { id: ID; targetWorkspace?: string; document?: string },
  context: GraphqlContext
): Promise<Pad> => {
  const data = await tables();
  const previousPad = await data.pads.get({ id });

  if (!previousPad) {
    throw new UserInputError('No such pad');
  }

  await notebooks.expectAuthorizedForGraphql({
    context,
    recordId: id,
    minimumPermissionType: 'READ',
  });

  const newName =
    targetWorkspace === previousPad.workspace_id
      ? `Copy of ${previousPad.name}`
      : previousPad.name;

  previousPad.name = newName;
  previousPad.isPublic = false;
  previousPad.archived = false;

  const workspaceId = targetWorkspace || previousPad.workspace_id;

  const { user } = await workspaces.expectAuthorizedForGraphql({
    context,
    recordId: workspaceId,
    minimumPermissionType: 'WRITE',
  });
  if (!user) {
    throw new ForbiddenError('not authenticated');
  }

  const clonedPad = await createPad2(workspaceId, previousPad, user);

  const replaceList = await duplicateNotebookAttachments(
    previousPad.id,
    clonedPad.id
  );

  const doc = (await snapshot(id)).value;
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
