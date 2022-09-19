import { fetchUpdatesAsBuffer } from '@decipad/y-indexeddb';

export const getLocalNotebookUpdates = async (
  docId: string
): Promise<Uint8Array | undefined> => fetchUpdatesAsBuffer(docId);
