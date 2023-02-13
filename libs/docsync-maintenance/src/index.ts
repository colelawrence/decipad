import { maybeBackup } from './backup';
import { compact } from './compact';
import { maybeRemoveOldBackups } from './removeOldBackups';

const parseId = (id: string): string => {
  return id.split('/').filter(Boolean)[1];
};

/* eslint-disable no-console */
export const notebookMaintenance = async (resourceId: string) => {
  const notebookId = parseId(resourceId);
  await maybeBackup(notebookId);
  await compact(resourceId);
  await maybeRemoveOldBackups(notebookId);
};
