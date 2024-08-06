import { useNotebookState } from '@decipad/notebook-state';
import { useNotebookId } from './useNotebookId';
import { LiveConnectionWorker } from '@decipad/live-connect';

export const useLiveConnectionWorker = (): LiveConnectionWorker => {
  const notebookId = useNotebookId();
  const liveConnectionWorker = useNotebookState(
    notebookId,
    (s) => s.liveConnectionWorker
  );
  return liveConnectionWorker();
};
