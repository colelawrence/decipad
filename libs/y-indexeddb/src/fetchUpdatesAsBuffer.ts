import * as idb from 'lib0/indexeddb';
import { mergeUpdates } from 'yjs';
import { updatesStoreName } from './y-indexeddb';

export const fetchUpdatesAsBuffer = async (
  docId: string
): Promise<Uint8Array | undefined> => {
  const docDB = await idb.openDB(docId, (db) =>
    idb.createStores(db, [['updates', { autoIncrement: true }]])
  );

  const [updatesStore] = idb.transact(docDB, [updatesStoreName], 'readonly');
  const updates = (await idb.getAll(
    updatesStore,
    idb.createIDBKeyRangeLowerBound(0, false)
  )) as Uint8Array[];

  if (updates.length) {
    return mergeUpdates(updates);
  }
  return undefined;
};
