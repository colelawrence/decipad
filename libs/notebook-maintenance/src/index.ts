import { maybeBackup } from './backup';
import { checkAttachments } from './checkAttachments';
import { compact } from './compact';
import { maybeRemoveOldBackups } from './removeOldBackups';
// import { maybeUpdateSearchIndex } from './searchIndex';

const parseId = (id: string): string => {
  return id.split('/').filter(Boolean)[1];
};

const minWaitingTimeMs = 1000 * 60;
const processingNotebookIds = new Map<string, number>();

const shouldProcessNotebook = (notebookId: string) => {
  const lastTime = processingNotebookIds.get(notebookId);
  return !lastTime || Date.now() - lastTime > minWaitingTimeMs;
};

const setProcessingNotebook = (notebookId: string) => {
  processingNotebookIds.set(notebookId, Date.now());
};

const cleanUp = () => {
  for (const [notebookId, lastTime] of processingNotebookIds.entries()) {
    if (Date.now() - lastTime > minWaitingTimeMs) {
      processingNotebookIds.delete(notebookId);
    }
  }
};

/* eslint-disable no-console */
export const notebookMaintenance = async (resourceId: string) => {
  const notebookId = parseId(resourceId);

  if (!shouldProcessNotebook(notebookId)) {
    return;
  }
  setProcessingNotebook(notebookId);
  console.log('starting maintenance on notebook', notebookId);
  const start = Date.now();
  try {
    await checkAttachments(notebookId);
    await maybeBackup(notebookId);
    await compact(resourceId);
    await maybeRemoveOldBackups(notebookId);
    // await maybeUpdateSearchIndex(notebookId);
  } finally {
    console.log(
      `finished maintenance on notebook ${notebookId}: ${Date.now() - start}ms`
    );
    cleanUp();
  }
};

export * from './backup';
