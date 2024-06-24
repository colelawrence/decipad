import { useNotebookState } from '@decipad/notebook-state';
import { useNotebookId } from './useNotebookId';
import { LiveConnectionWorker } from '@decipad/live-connect';

export const useLiveConnectionWorker = (): LiveConnectionWorker => {
  const notebookId = useNotebookId();
  const notebook = useNotebookState(notebookId);
  return notebook.liveConnectionWorker();
};
