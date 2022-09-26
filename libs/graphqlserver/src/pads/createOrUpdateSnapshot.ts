import { nanoid } from 'nanoid';
import { GraphqlContext, ID, PadSnapshot } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { snapshot } from '@decipad/services/notebooks';
import timestamp from '../utils/timestamp';
import { isAuthenticatedAndAuthorized } from '../authorization';

export const createOrUpdateSnapshot = async (
  _: unknown,
  { notebookId, name }: { notebookId: ID; name: string },
  context: GraphqlContext
): Promise<PadSnapshot> => {
  const resource = `/pads/${notebookId}`;
  await isAuthenticatedAndAuthorized(resource, context, 'WRITE');

  const data = await tables();
  let [existingSnapshot] = (
    await data.docsyncsnapshots.query({
      IndexName: 'byDocsyncId',
      KeyConditionExpression: 'docsync_id = :docsync_id',
      ExpressionAttributeValues: {
        ':docsync_id': notebookId,
      },
    })
  ).Items;

  const snapshotData = await snapshot(notebookId);

  if (!existingSnapshot) {
    existingSnapshot = {
      id: nanoid(),
      createdAt: timestamp(),
      updatedAt: timestamp(),
      docsync_id: notebookId,
      name,
      data: snapshotData,
    };
  } else {
    existingSnapshot.data = snapshotData;
    existingSnapshot.updatedAt = timestamp();
  }

  await data.docsyncsnapshots.put(existingSnapshot);

  return existingSnapshot;
};
