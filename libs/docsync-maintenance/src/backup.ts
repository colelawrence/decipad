import { format } from 'date-fns';
import tables from '@decipad/tables';
import {
  snapshot,
  snapshotFilePath,
  storeSnapshotDataAsFile,
} from '@decipad/services/notebooks';
import { nanoid } from 'nanoid';
import { DocSyncSnapshotRecord } from '@decipad/backendtypes';
import { timestamp } from '@decipad/backend-utils';

const MAX_DATA_SIZE_BYTES = 100_000;

const currentEpoque = () => format(new Date(), 'yyyy-MM-dd:HH O');

export const needsBackup = async (
  epoque: string,
  notebookId: string
): Promise<boolean> => {
  const data = await tables();
  return (
    (
      await data.docsyncsnapshots.query({
        IndexName: 'byDocsyncIdAndSnapshotName',
        KeyConditionExpression:
          'docsync_id = :docsync_id AND snapshotName = :name',
        ExpressionAttributeValues: {
          ':docsync_id': notebookId,
          ':name': epoque,
        },
        Select: 'COUNT',
      })
    ).Count === 0
  );
};

const backup = async (snapshotName: string, notebookId: string) => {
  const { data, version } = await snapshot(notebookId);

  const newSnapshot: DocSyncSnapshotRecord = {
    id: nanoid(),
    isBackup: true,
    createdAt: timestamp(),
    updatedAt: timestamp(),
    docsync_id: notebookId,
    snapshotName,
    version,
  };

  if (data.length > MAX_DATA_SIZE_BYTES) {
    const path = snapshotFilePath(notebookId, snapshotName);
    await storeSnapshotDataAsFile(path, data);

    newSnapshot.data_file_path = path;
  } else {
    newSnapshot.data = data.toString('base64');
  }

  await (await tables()).docsyncsnapshots.put(newSnapshot);
};

export const maybeBackup = async (notebookId: string) => {
  const epoque = currentEpoque();
  if (!(await needsBackup(epoque, notebookId))) {
    return;
  }
  await backup(epoque, notebookId);
};
