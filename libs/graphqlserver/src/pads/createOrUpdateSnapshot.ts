import { nanoid } from 'nanoid';
import { GraphqlContext, ID } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { snapshot, storeSnapshotDataAsFile } from '@decipad/services/notebooks';
import { timestamp } from '@decipad/services/utils';
import Boom from '@hapi/boom';
import { isAuthenticatedAndAuthorized } from '../authorization';
import { snapshotFilePath } from './snapshotFilePath';

const MAX_DATA_SIZE_BYTES = 100_000;

export const createOrUpdateSnapshot = async (
  _: unknown,
  { notebookId, snapshotName }: { notebookId: ID; snapshotName: string },
  context: GraphqlContext
): Promise<boolean> => {
  const resource = `/pads/${notebookId}`;
  await isAuthenticatedAndAuthorized(resource, context, 'WRITE');

  const data = await tables();
  let [existingSnapshot] = (
    await data.docsyncsnapshots.query({
      IndexName: 'byDocsyncId',
      KeyConditionExpression: 'docsync_id = :docsync_id',
      FilterExpression: 'snapshotName = :name ',
      ExpressionAttributeValues: {
        ':docsync_id': notebookId,
        ':name': snapshotName,
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
      version: snapshotData.version,
    };
  } else {
    delete existingSnapshot.data;
    existingSnapshot.version = snapshotData.version;
    existingSnapshot.updatedAt = timestamp();
  }

  if (snapshotData.data.length > MAX_DATA_SIZE_BYTES) {
    const path = snapshotFilePath(notebookId, snapshotName);
    await storeSnapshotDataAsFile(path, snapshotData.data);
    existingSnapshot.data_file_path = path;
  } else {
    existingSnapshot.data = snapshotData.data.toString('base64');
  }

  await data.docsyncsnapshots.put(existingSnapshot);

  const pad = await data.pads.get({ id: notebookId });

  if (!pad) {
    throw Boom.notFound();
  }

  return true;
};

export const getSnapshots = async ({ notebookId }: { notebookId: ID }) => {
  const data = await tables();
  return (
    await data.docsyncsnapshots.query({
      IndexName: 'byDocsyncId',
      KeyConditionExpression: 'docsync_id = :docsync_id',
      FilterExpression: 'isBackup <> :backup ',
      ExpressionAttributeValues: {
        ':docsync_id': notebookId,
        ':backup': true,
      },
    })
  ).Items;
};
