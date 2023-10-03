import { nanoid } from 'nanoid';
import { GraphqlContext, ID } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { snapshot, storeSnapshotDataAsFile } from '@decipad/services/notebooks';
import { timestamp } from '@decipad/backend-utils';
import Boom from '@hapi/boom';
import { resource } from '@decipad/backend-resources';
import { indexNotebook } from '@decipad/backend-search';
import { snapshotFilePath } from './snapshotFilePath';
import stringify from 'json-stringify-safe';

const MAX_DATA_SIZE_BYTES = 100_000;

const notebooks = resource('notebook');

export const createOrUpdateSnapshot = async (
  _: unknown,
  {
    notebookId,
    snapshotName,
    forceSearchIndexUpdate,
  }: { notebookId: ID; snapshotName: string; forceSearchIndexUpdate: boolean },
  context: GraphqlContext
): Promise<boolean> => {
  await notebooks.expectAuthorizedForGraphql({
    context,
    recordId: notebookId,
    minimumPermissionType: 'WRITE',
  });

  const data = await tables();
  const pad = await data.pads.get({ id: notebookId });

  if (!pad) {
    throw Boom.notFound();
  }

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

  if (pad.isTemplate && forceSearchIndexUpdate) {
    await indexNotebook(pad, stringify(snapshotData.value));
  }

  return true;
};

export const getSnapshots = async ({ notebookId }: { notebookId: ID }) => {
  const data = await tables();
  const snapshots = (
    await data.docsyncsnapshots.query({
      IndexName: 'byDocsyncId',
      KeyConditionExpression: 'docsync_id = :docsync_id',
      FilterExpression: 'isBackup <> :backup',
      ExpressionAttributeValues: {
        ':docsync_id': notebookId,
        ':backup': true,
      },
    })
  ).Items;

  // we need to convert dates into ms again
  return snapshots.map((ss) => ({
    ...ss,
    updatedAt: ss.updatedAt * 1000,
  }));
};
