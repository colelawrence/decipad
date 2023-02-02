import { GraphqlContext, ID } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { UserInputError } from 'apollo-server-lambda';
import { track } from '@decipad/backend-analytics';
import { isAuthenticatedAndAuthorized } from '../authorization';

export const setPadPublic = async (
  _: unknown,
  { id, isPublic }: { id: ID; isPublic: boolean },
  context: GraphqlContext
): Promise<boolean> => {
  const resource = `/pads/${id}`;
  const user = await isAuthenticatedAndAuthorized(resource, context, 'ADMIN');
  const data = await tables();
  const pad = await data.pads.get({ id });
  if (!pad) {
    throw new UserInputError('No such pad');
  }
  pad.isPublic = isPublic;
  await data.pads.put(pad);

  const event = isPublic ? 'notebook published' : 'notebook unpublished';
  await track(
    { userId: user.id, event, properties: { notebookdId: id } },
    context
  );

  return true;
};
