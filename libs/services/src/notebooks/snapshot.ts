import { applyUpdate, Doc, mergeUpdates } from 'yjs';
import md5 from 'md5';
import { canonicalize } from 'json-canonicalize';
import { toSlateDoc } from '@decipad/slate-yjs';
import { notFound } from '@hapi/boom';
import tables, { allPages } from '@decipad/tables';
import { NotebookValue, RootDocument } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import type { DocSyncSnapshotRecord } from '@decipad/backendtypes';
import { fetchSnapshotFromFile } from '../../../backend-notebook-content/src/fetchSnapshotFromFile';

export const snapshot = async (
  notebookId: string,
  remoteState?: string
): Promise<{ data: Buffer; version: string; value: RootDocument }> => {
  const data = await tables();

  const updates: Buffer[] = remoteState
    ? [Buffer.from(remoteState, 'base64')]
    : [];
  const resource = `/pads/${notebookId}`;
  for await (const update of allPages(data.docsyncupdates, {
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': resource,
    },
    ConsistentRead: true,
  })) {
    if (update) {
      updates.push(Buffer.from(update.data, 'base64'));
    }
  }

  if (!updates.length) {
    throw notFound('No updates for this notebook found');
  }

  const mergedUpdates = mergeUpdates(updates);
  const doc = new Doc();
  if (mergedUpdates?.length) {
    applyUpdate(doc, mergedUpdates);
  }
  const value = toSlateDoc(doc.getArray()) as unknown as NotebookValue;
  const canonicalizedObj = canonicalize(value);

  return {
    value: { children: value },
    data: Buffer.from(mergedUpdates),
    version: md5(canonicalizedObj),
  };
};

export interface Snapshot {
  name: string;
  doc: RootDocument;
  date?: Date;
}

export const snapshotFromDbSnapshot = async (
  snapshotRec: DocSyncSnapshotRecord
): Promise<Snapshot | undefined> => {
  const data =
    (snapshotRec.data && Buffer.from(snapshotRec.data, 'base64')) ||
    (await fetchSnapshotFromFile(getDefined(snapshotRec.data_file_path)));

  if (!data) {
    return undefined;
  }
  const doc = new Doc();
  applyUpdate(doc, data);

  return {
    name: snapshotRec.snapshotName,
    doc: { children: toSlateDoc(doc.getArray()) as unknown as NotebookValue },
    date:
      (snapshotRec.createdAt && new Date(snapshotRec.createdAt * 1000)) ||
      undefined,
  };
};

export const getStoredSnapshot = async (
  notebookId: string,
  snapshotName: string
): Promise<Snapshot | undefined> => {
  const data = await tables();
  const snapshotRec = (
    await data.docsyncsnapshots.query({
      IndexName: 'byDocsyncIdAndSnapshotName',
      KeyConditionExpression:
        'docsync_id = :docsyncId and snapshotName = :snapshotName',
      ExpressionAttributeValues: {
        ':docsyncId': notebookId,
        ':snapshotName': snapshotName,
      },
    })
  ).Items[0];
  return snapshotRec && snapshotFromDbSnapshot(snapshotRec);
};
