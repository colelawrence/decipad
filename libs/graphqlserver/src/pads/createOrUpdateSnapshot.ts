import { nanoid } from 'nanoid';
import { GraphqlContext, ID, PadRecord } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { snapshot } from '@decipad/services/notebooks';
import Boom from '@hapi/boom';
import timestamp from '../utils/timestamp';
import { isAuthenticatedAndAuthorized } from '../authorization';

export const createOrUpdateSnapshot = async (
  _: unknown,
  { notebookId, snapshotName }: { notebookId: ID; snapshotName: string },
  context: GraphqlContext
): Promise<PadRecord> => {
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
      snapshotName,
      ...snapshotData,
    };
  } else {
    existingSnapshot.data = snapshotData.data;
    existingSnapshot.version = snapshotData.version;
    existingSnapshot.updatedAt = timestamp();
  }

  await data.docsyncsnapshots.put(existingSnapshot);

  const pad = await data.pads.get({ id: notebookId });

  if (!pad) {
    throw Boom.notFound();
  }

  return pad;
};

export const getSnapshots = async ({ notebookId }: { notebookId: ID }) => {
  const data = await tables();
  return (
    await data.docsyncsnapshots.query({
      IndexName: 'byDocsyncId',
      KeyConditionExpression: 'docsync_id = :docsync_id',
      ExpressionAttributeValues: {
        ':docsync_id': notebookId,
      },
    })
  ).Items;
};
