import { tables } from '@architect/functions';
import { indexNotebook } from '@decipad/backend-search';
import { getStoredSnapshot } from '@decipad/services/notebooks';
import { verbalizeDoc } from '@decipad/doc-verbalizer';
import { getRemoteComputer } from '@decipad/remote-computer';
import { PublishedVersionName } from '@decipad/interfaces';

const SNAPSHOT_NAME = PublishedVersionName.Published;

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
      const verbalized = verbalizeDoc(snapshotContent.doc, getRemoteComputer())
        .verbalized.map((v) => v.verbalized)
        .join('\n\n');
      await indexNotebook(notebook, verbalized);
    }
  }
};
