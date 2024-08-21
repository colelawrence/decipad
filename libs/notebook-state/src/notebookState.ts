import { captureException } from '@sentry/browser';
import { setErrorReporter } from '@decipad/remote-computer';
import { createNotebookStore } from './oneNotebookState';

const NOTEBOOK_DESTROY_DELAY_MS = 5000;

// set the computer's error reporter
setErrorReporter((err) => {
  console.error('Error caught on computer:', err);
  captureException(err);
});

export type NotebookStoreWithSubscribers = ReturnType<
  typeof createNotebookStore
>;

const notebooks = new Map<string, NotebookStoreWithSubscribers>();

export const getNotebookStore = (
  notebookId: string
): NotebookStoreWithSubscribers => {
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
