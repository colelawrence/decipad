import { tables } from '@architect/functions';
import { getStoredSnapshot } from '@decipad/services/notebooks';
import { verbalizeDoc } from '@decipad/doc-verbalizer';
import { indexNotebook } from './indexNotebook';

const SNAPSHOT_NAME = 'Published 1';

export const indexNotebookSnapshot = async (
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
      const verbalized = verbalizeDoc(snapshotContent.doc)
        .verbalized.map((v) => v.verbalized)
        .join('\n\n');
      await indexNotebook(notebook, verbalized);
    }
  }
};
