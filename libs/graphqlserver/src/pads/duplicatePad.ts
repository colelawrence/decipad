import { GraphqlContext, ID, Pad } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import {
  create as createPad2,
  duplicate as duplicateSharedDoc,
  duplicateNotebookAttachments,
  importDoc,
} from '@decipad/services/notebooks';
import { UserInputError } from 'apollo-server-lambda';
import { isAuthenticatedAndAuthorized } from '../authorization';

export const duplicatePad = async (
  _: unknown,
  {
    id,
    targetWorkspace,
    document,
  }: { id: ID; targetWorkspace?: string; document?: string },
  context: GraphqlContext
): Promise<Pad> => {
  const resource = `/pads/${id}`;
  const data = await tables();
  const previousPad = await data.pads.get({ id });

  if (!previousPad) {
    throw new UserInputError('No such pad');
  }

  const newName =
    targetWorkspace === previousPad.workspace_id
      ? `Copy of ${previousPad.name}`
      : previousPad.name;

  if (!previousPad.isPublic) {
    await isAuthenticatedAndAuthorized(resource, context, 'READ');
  }

  previousPad.name = newName;
  previousPad.isPublic = false;

  const workspaceId = targetWorkspace || previousPad.workspace_id;

  const workspaceResource = `/workspaces/${workspaceId}`;
  const user = await isAuthenticatedAndAuthorized(
    workspaceResource,
    context,
    'WRITE'
  );

  const clonedPad = await createPad2(workspaceId, previousPad, user);

  const replaceList = await duplicateNotebookAttachments(
    previousPad.id,
    clonedPad.id
  );

  if (document) {
    return importDoc({
      workspaceId,
      source: document,
      user,
      pad: clonedPad,
      replaceList,
    });
  }
  await duplicateSharedDoc(id, clonedPad.id, previousPad.name);
  return clonedPad;
};
