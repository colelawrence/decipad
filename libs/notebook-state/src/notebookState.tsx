import { StoreApi, useStore } from 'zustand';
import { captureException } from '@sentry/browser';
import { setErrorReporter } from '@decipad/computer';
import { NotebookState } from './state';
import { createNotebookStore } from './oneNotebookState';

// set the computer's error reporter
setErrorReporter(captureException);

const notebooks = new Map<string, StoreApi<NotebookState>>();

const getNotebookStore = (notebookId: string): StoreApi<NotebookState> => {
  let store = notebooks.get(notebookId);
  if (!store) {
    const onDestroy = () => {
      // eslint-disable-next-line no-console
      console.log(`notebook ${notebookId} destroyed`);
      notebooks.delete(notebookId);
    };
    store = createNotebookStore(onDestroy);
    notebooks.set(notebookId, store);
  }
  return store;
};

export const useNotebookState = (notebookId: string) =>
  useStore(getNotebookStore(notebookId));
