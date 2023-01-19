import tables, { allPages } from '@decipad/tables';
import { Buffer } from 'buffer';
import { mergeUpdates } from 'yjs';
import { getDefined } from '@decipad/utils';
import { fetchSnapshotFromFile } from './fetchSnapshotFromFile';

const fetchUpdates = async (padId: string): Promise<Uint8Array[]> => {
  const data = await tables();
  const updates: Uint8Array[] = [];
  for await (const docsyncUpdate of allPages(data.docsyncupdates, {
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': padId,
    },
    ConsistentRead: true,
  })) {
    if (docsyncUpdate && docsyncUpdate.data) {
      updates.push(Buffer.from(docsyncUpdate.data, 'base64'));
    }
  }

  return updates;
};

const fetchSnapshot = async (
  padId: string,
  version: string
): Promise<Uint8Array[]> => {
  const data = await tables();
  const updates: Uint8Array[] = [];
  for await (const snapshot of allPages(data.docsyncsnapshots, {
    IndexName: 'byDocsyncIdAndSnapshotName',
    KeyConditionExpression: 'docsync_id = :docsync_id AND snapshotName = :n',
    ExpressionAttributeValues: {
      ':docsync_id': padId,
      ':n': getDefined(version),
    },
  })) {
    if (snapshot) {
      if (snapshot.data) {
        updates.push(Buffer.from(snapshot.data, 'base64'));
      } else if (snapshot.data_file_path) {
        const snap = await fetchSnapshotFromFile(snapshot.data_file_path);
        if (snap) {
          updates.push(snap);
        }
      }
    }
  }
  if (updates.length < 1) {
    // eslint-disable-next-line no-console
    console.warn(`Notebook with id ${padId} had no snapshot updates`);
    // notebook is public but snapshot hasn't been created (old publish version)
    return fetchUpdates(padId);
  }
  return updates;
};

export const getNotebookInitialState = async (
  padId: string,
  version?: string
): Promise<Uint8Array> => {
  const id = `/pads/${padId}`;

  const updates = await (version
    ? fetchSnapshot(padId, version)
    : fetchUpdates(id));

  return mergeUpdates(updates);
};
