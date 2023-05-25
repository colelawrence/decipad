import { setErrorReporter } from '@decipad/computer';
import { captureException } from '@sentry/browser';
import { StoreApi, useStore } from 'zustand';
import { createNotebookStore } from './oneNotebookState';
import { NotebookState } from './state';

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
      // eslint-disable-next-line no-console
      console.debug(`notebook ${notebookId} destroyed`);
      notebooks.delete(notebookId);
    };
    store = createNotebookStore(onDestroy);
    notebooks.set(notebookId, store);
  }
  return store;
};

export const useNotebookState = (notebookId: string) =>
  useStore(getNotebookStore(notebookId));
