import { Buffer } from 'buffer';
import { applyUpdate, mergeUpdates, Doc as YDoc } from 'yjs';
import tables, { allPages } from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import type { NotebookValue, RootDocument } from '@decipad/editor-types';
import { fetchSnapshotFromFile } from './fetchSnapshotFromFile';

// When loading the editor initial state, if the snapshot is void, try to load the actual notebook.
// For that, we also need to detect when the updates are null ([0, 0]).
const isZero = (n: number) => n === 0;
const isUpdateVoid = (update: Uint8Array): boolean =>
  update.length === 0 || update.every(isZero);
const areUpdatesVoid = (updates: Uint8Array[]): boolean => {
  return updates.length < 1 || updates.every(isUpdateVoid);
};

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
  if (areUpdatesVoid(updates)) {
    // eslint-disable-next-line no-console
    console.warn(`Notebook with id ${padId} had no snapshot updates`);
    // notebook is public but snapshot hasn't been created (old publish version)
    return fetchUpdates(`/pads/${padId}`);
  }
  return updates;
};

export const getNotebookInitialState = async (
  notebookId: string,
  version?: string
): Promise<Uint8Array> => {
  const id = `/pads/${notebookId}`;

  const updates = await (version
    ? fetchSnapshot(notebookId, version)
    : fetchUpdates(id));

  return mergeUpdates(updates);
};

export const getNotebookContent = async (
  notebookId: string
): Promise<RootDocument> => {
  const initialState = await getNotebookInitialState(notebookId);
  const doc = new YDoc();
  applyUpdate(doc, initialState);
  return { children: doc.getArray().toJSON() as NotebookValue };
};
