import { GraphqlContext, ID } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { track } from '@decipad/backend-analytics';
import { UserInputError } from 'apollo-server-lambda';
import { resource } from '@decipad/backend-resources';

const notebooks = resource('notebook');

export const setPadPublic = async (
  _: unknown,
  { id, isPublic }: { id: ID; isPublic: boolean },
  context: GraphqlContext
): Promise<boolean> => {
  const { user } = await notebooks.expectAuthorizedForGraphql({
    context,
    recordId: id,
    minimumPermissionType: 'ADMIN',
  });
  const data = await tables();
  const pad = await data.pads.get({ id });
  if (!pad) {
    throw new UserInputError('No such pad');
  }
  pad.isPublic = isPublic;
  await data.pads.put(pad);

  const event = isPublic ? 'notebook published' : 'notebook unpublished';
  await track(
    { userId: user?.id, event, properties: { notebookdId: id } },
    context
  );

  return true;
};
