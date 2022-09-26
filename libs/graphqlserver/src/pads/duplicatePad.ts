import { GraphqlContext, ID, Pad } from '@decipad/backendtypes';
import {
  create as createPad2,
  duplicate as duplicateSharedDoc,
  importDoc,
} from 'libs/services/src/notebooks';
import tables from '@decipad/tables';
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
};
