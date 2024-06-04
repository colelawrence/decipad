import { tables } from '@architect/functions';
import { getStoredSnapshot } from '@decipad/services/notebooks';
import { verbalizeDoc } from '@decipad/doc-verbalizer';
// eslint-disable-next-line no-restricted-imports
import { getComputer } from '@decipad/computer';
import { indexNotebook } from './indexNotebook';
import { PublishedVersionName } from '@decipad/interfaces';

const SNAPSHOT_NAME = PublishedVersionName.Published;

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
      const verbalized = verbalizeDoc(snapshotContent.doc, getComputer())
        .verbalized.map((v) => v.verbalized)
        .join('\n\n');
      await indexNotebook(notebook, verbalized);
    }
  }
};
