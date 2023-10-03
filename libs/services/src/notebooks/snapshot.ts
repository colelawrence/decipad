import { toSlateDoc } from '@decipad/slate-yjs';
import tables, { allPages } from '@decipad/tables';
import { Document } from '@decipad/editor-types';
import md5 from 'md5';
import { canonicalize } from 'json-canonicalize';
import { applyUpdate, Doc, mergeUpdates } from 'yjs';
import { fetchSnapshotFromFile } from '../../../backend-notebook-content/src/fetchSnapshotFromFile';
import { getDefined } from '@decipad/utils';
import { DocSyncSnapshotRecord } from '@decipad/backendtypes';

export const snapshot = async (
  notebookId: string
): Promise<{ data: Buffer; version: string; value: Document }> => {
  const data = await tables();

  const updates: Buffer[] = [];
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

  const mergedUpdates = mergeUpdates(updates) ?? new Uint8Array();
  const doc = new Doc();
  if (mergedUpdates.length) {
    applyUpdate(doc, mergedUpdates);
  }
  const value = toSlateDoc(doc.getArray());
  const canonicalizedObj = canonicalize(value);

  return {
    value: { children: value },
    data: Buffer.from(mergedUpdates),
    version: md5(canonicalizedObj),
  };
};

export interface Snapshot {
  name: string;
  doc: Document;
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
    doc: { children: toSlateDoc(doc.getArray()) },
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
