import { captureException } from '@sentry/browser';
import { setErrorReporter } from '@decipad/computer';
import { useStore } from 'zustand';
import type { StoreApi } from 'zustand';
import type { NotebookState } from './state';
import { createNotebookStore } from './oneNotebookState';

const NOTEBOOK_DESTROY_DELAY_MS = 5_000;

// set the computer's error reporter
setErrorReporter((err) => {
  console.error('Error caught on computer:', err);
  captureException(err);
});

const notebooks = new Map<string, StoreApi<NotebookState>>();

const getNotebookStore = (notebookId: string): StoreApi<NotebookState> => {
  let store = notebooks.get(notebookId);
  if (!store) {
    const onDestroy = () => {
      setTimeout(() => {
        if (store?.getState().destroyed) {
          // eslint-disable-next-line no-console
          console.log(`notebook ${notebookId} destroyed`);
          notebooks.delete(notebookId);
        }
      }, NOTEBOOK_DESTROY_DELAY_MS);
    };
    store = createNotebookStore(onDestroy);
    notebooks.set(notebookId, store);
  }
  return store;
};

export const useNotebookState = (notebookId: string) =>
  useStore(getNotebookStore(notebookId));
