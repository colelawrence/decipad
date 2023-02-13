import tables, { allPages } from '@decipad/tables';
import { DocSyncSnapshotRecord } from '@decipad/backendtypes';

const MAX_BACKUPS_PER_NOTEBOOK = 50;

const fetchBackupSnapshots = async (
  notebookId: string
): Promise<DocSyncSnapshotRecord[]> => {
  const data = await tables();
  const backupSnapshots: DocSyncSnapshotRecord[] = [];
  for await (const snapshot of allPages(data.docsyncsnapshots, {
    IndexName: 'byDocsyncId',
    KeyConditionExpression: 'docsync_id = :docsync_id',
    ExpressionAttributeValues: {
      ':docsync_id': notebookId,
    },
  })) {
    if (snapshot?.isBackup) {
      backupSnapshots.push(snapshot);
    }
  }
  return backupSnapshots;
};

const byCreationDate = (a: DocSyncSnapshotRecord, b: DocSyncSnapshotRecord) =>
  (a.createdAt ?? 0) - (b.createdAt ?? 0);

const snapshotsNeedingRemoval = async (
  notebookId: string
): Promise<string[]> => {
  const allBackupSnapshots = await fetchBackupSnapshots(notebookId);
  if (allBackupSnapshots.length <= MAX_BACKUPS_PER_NOTEBOOK) {
    return [];
  }

  return [...allBackupSnapshots]
    .sort(byCreationDate)
    .slice(0, allBackupSnapshots.length - MAX_BACKUPS_PER_NOTEBOOK)
    .map((s) => s.id);
};

export const maybeRemoveOldBackups = async (
  notebookId: string
): Promise<void> => {
  const toRemove = await snapshotsNeedingRemoval(notebookId);
  const data = await tables();

  for (const remove of toRemove) {
    // eslint-disable-next-line no-await-in-loop
    await data.docsyncsnapshots.delete({ id: remove });
  }
};
