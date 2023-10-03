import { tables } from '@architect/functions';
import { indexNotebook } from '@decipad/backend-search';
import { getStoredSnapshot } from '@decipad/services/notebooks';
import stringify from 'json-stringify-safe';

const SNAPSHOT_NAME = 'Published 1';

export const maybeUpdateSearchIndex = async (
  notebookId: string
): Promise<void> => {
  const data = await tables();
  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    return;
  }
  if (notebook.isTemplate) {
    const snapshotContent = await getStoredSnapshot(notebookId, SNAPSHOT_NAME);
    if (snapshotContent) {
      await indexNotebook(notebook, stringify(snapshotContent.doc));
    }
  }
};
