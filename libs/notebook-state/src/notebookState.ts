import { captureException } from '@sentry/browser';
import { setErrorReporter } from '@decipad/remote-computer';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import type { StoreApi } from 'zustand';
import type { NotebookState } from './state';
import { createNotebookStore } from './oneNotebookState';

const NOTEBOOK_DESTROY_DELAY_MS = 5000;

// set the computer's error reporter
setErrorReporter((err) => {
  console.error('Error caught on computer:', err);
  captureException(err);
});

const notebooks = new Map<string, StoreApi<NotebookState>>();

export const getNotebookStore = (
  notebookId: string
): StoreApi<NotebookState> => {
  let store = notebooks.get(notebookId);
  if (store != null) return store;

  const onDestroy = () => {
    setTimeout(() => {
      if (!store?.getState().destroyed) return;

      // eslint-disable-next-line no-console
      console.log(`notebook ${notebookId} state destroyed`);

      store?.getState().computer?.terminate();
      notebooks.delete(notebookId);
    }, NOTEBOOK_DESTROY_DELAY_MS);
  };

  store = createNotebookStore(notebookId, onDestroy);
  notebooks.set(notebookId, store);

  return store;
};

export const useNotebookState = <U = NotebookState>(
  notebookId: string,
  selector: Parameters<
    typeof useStoreWithEqualityFn<ReturnType<typeof getNotebookStore>, U>
  >[1] = (state) => state as U
) => {
  const notebookStore = getNotebookStore(notebookId);
  const partialStore = useStoreWithEqualityFn(notebookStore, selector);

  return partialStore;
};
