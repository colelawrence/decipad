import tables from '@decipad/tables';
import { track } from '@decipad/backend-analytics';
import { UserInputError } from 'apollo-server-lambda';
import { resource } from '@decipad/backend-resources';
import type { MutationResolvers } from '@decipad/graphqlserver-types';
import { PublishedVersionName } from '@decipad/interfaces';

const notebooks = resource('notebook');

async function unpublishSnapshots(padId: string): Promise<void> {
  const data = await tables();

  const publishedVersions = (
    await data.docsyncsnapshots.query({
      IndexName: 'byDocsyncIdAndSnapshotName',
      KeyConditionExpression:
        'docsync_id = :docsync_id AND snapshotName = :name',
      ExpressionAttributeValues: {
        ':docsync_id': padId,
        ':name': PublishedVersionName.Published,
      },
    })
  ).Items;

  await Promise.all(
    publishedVersions.map((snapshot) =>
      data.docsyncsnapshots.put({
        ...snapshot,
        snapshotName: PublishedVersionName.Unpublished,
      })
    )
  );
}

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
  if (user?.banned) {
    throw new UserInputError('User is banned');
  }
  const data = await tables();
  const pad = await data.pads.get({ id });
  if (!pad) {
    throw new UserInputError('No such pad');
  }

  if (pad.banned) {
    throw new UserInputError('Pad is banned');
  }

  const isPublic = publishState !== 'PRIVATE';
  const userAllowsPublicHighlighting = publishState === 'PUBLICLY_HIGHLIGHTED';

  pad.isPublic = isPublic;
  pad.userAllowsPublicHighlighting = userAllowsPublicHighlighting;

  if (isPublic) {
    // eslint-disable-next-line no-console
    console.log('publishing pad', pad.id, 'user', user);
  }

  await data.pads.put(pad);

  if (publishState === 'PRIVATE') {
    await unpublishSnapshots(pad.id);
  }

  const event = isPublic ? 'Notebook Published' : 'Notebook Unpublished';

  await track(
    context.event,
    {
      userId: user?.id,
      event,
      properties: {
        notebookdId: id,
        type:
          publishState === 'PUBLIC'
            ? 'Private URL'
            : publishState === 'PUBLICLY_HIGHLIGHTED'
            ? 'Public URL'
            : 'Unpublished',
      },
    },
    context
  );

  return true;
};
