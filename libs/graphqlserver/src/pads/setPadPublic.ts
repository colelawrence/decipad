import { GraphqlContext, ID, Pad } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { UserInputError } from 'apollo-server-lambda';
import { isAuthenticatedAndAuthorized } from '../authorization';

export const setPadPublic = async (
  _: unknown,
  { id, isPublic }: { id: ID; isPublic: boolean },
  context: GraphqlContext
): Promise<Pad> => {
  const resource = `/pads/${id}`;
  await isAuthenticatedAndAuthorized(resource, context, 'ADMIN');
  const data = await tables();
  const pad = await data.pads.get({ id });
  if (!pad) {
    throw new UserInputError('No such pad');
  }
  pad.isPublic = isPublic;
  await data.pads.put(pad);
  return pad;
};
