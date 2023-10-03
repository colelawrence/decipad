import { maybeBackup } from './backup';
import { compact } from './compact';
import { maybeRemoveOldBackups } from './removeOldBackups';
// import { maybeUpdateSearchIndex } from './searchIndex';

const parseId = (id: string): string => {
  return id.split('/').filter(Boolean)[1];
};

const processingNotebookIds = new Set<string>();

/* eslint-disable no-console */
export const notebookMaintenance = async (resourceId: string) => {
  const notebookId = parseId(resourceId);
  if (processingNotebookIds.has(notebookId)) {
    return;
  }
  processingNotebookIds.add(notebookId);
  try {
    await maybeBackup(notebookId);
    await compact(resourceId);
    await maybeRemoveOldBackups(notebookId);
    // await maybeUpdateSearchIndex(notebookId);
  } finally {
    processingNotebookIds.delete(notebookId);
  }
};
