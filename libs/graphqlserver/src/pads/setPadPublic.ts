import tables from '@decipad/tables';
import { track } from '@decipad/backend-analytics';
import { UserInputError } from 'apollo-server-lambda';
import { resource } from '@decipad/backend-resources';
import { MutationResolvers } from '@decipad/graphqlserver-types';

const notebooks = resource('notebook');

export const setPadPublic: MutationResolvers['setPadPublic'] = async (
  _,
  { id, publishState },
  context
) => {
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

  const isPublic = publishState !== 'PRIVATE';
  const userAllowsPublicHighlighting = publishState === 'PUBLICLY_HIGHLIGHTED';

  pad.isPublic = isPublic;
  pad.userAllowsPublicHighlighting = userAllowsPublicHighlighting;

  await data.pads.put(pad);

  const event = isPublic ? 'notebook published' : 'notebook unpublished';
  await track(
    context.event,
    { userId: user?.id, event, properties: { notebookdId: id } },
    context
  );

  return true;
};
