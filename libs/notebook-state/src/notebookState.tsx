import { createDocSyncEditor } from '@decipad/docsync';
import { FC, ReactNode } from 'react';
import { create } from 'zustand';
import createContext from 'zustand/context';
import { captureException } from '@sentry/browser';
import { take } from 'rxjs';
import { Computer } from '@decipad/computer';
import { createTPlateEditor } from '@decipad/editor-types';
import { NotebookState } from './state';

interface NotebookStateProviderProps {
  children?: ReactNode;
}

const { Provider, useStore } = createContext();
const LOAD_TIMEOUT_MS = 5000;

const initialState: Omit<
  NotebookState,
  'initComputer' | 'initEditor' | 'destroy' | 'setInitialFocusDone'
> = {
  syncClientState: 'idle',
  editor: undefined,
  computer: undefined,
  loadedFromLocal: false,
  loadedFromRemote: false,
  timedOutLoadingFromRemote: false,
  hasLocalChanges: false,
  initialFocusDone: false,
};

const createStore = () =>
  create<NotebookState>((set, get) => ({
    ...initialState,
    initComputer: () => {
      set({ computer: new Computer() });
    },
    initEditor: (notebookId, { plugins, docsync }, getSession) => {
      if (docsync.initialState == null) {
        // do not accept initializations without initial state
        return;
      }

      console.log('initEditor', docsync);

      // verify that if we have a matching connected docsync instance
      const { editor: oldEditor, syncClientState } = get();
      if (oldEditor) {
        if (
          syncClientState === 'created' &&
          oldEditor.id === notebookId &&
          oldEditor.isReadOnly === docsync.readOnly &&
          !oldEditor.destroyed
        ) {
          // the one we have is just fine
          return;
        }
        try {
          oldEditor.disconnect();
          oldEditor.destroy();
        } catch (err) {
          console.error('error destroying old docsync instance', err);
        }
      }

      const editor = createTPlateEditor({
        id: notebookId,
        plugins,
        disableCorePlugins: { history: true },
      });

      const loadTimeout = setTimeout(() => {
        set({ timedOutLoadingFromRemote: true });
      }, LOAD_TIMEOUT_MS);
      const docSyncEditor = createDocSyncEditor(
        notebookId,
        {
          ...docsync,
          editor,
          onError: captureException,
        },
        getSession
      );

      docSyncEditor.onLoaded((source) => {
        if (source === 'local') {
          set({ loadedFromLocal: true });
        } else if (source === 'remote') {
          clearTimeout(loadTimeout);
          set({ loadedFromRemote: true });
        }
      });
      docSyncEditor
        .hasLocalChanges()
        .pipe(take(1))
        .subscribe(() => {
          set({ hasLocalChanges: true });
        });
      set({
        editor: docSyncEditor,
        notebookHref: window.location.pathname,
        syncClientState: 'created',
        loadedFromLocal: false,
        loadedFromRemote: false,
        timedOutLoadingFromRemote: false,
        hasLocalChanges: false,
      });
    },
    setInitialFocusDone: () => {
      set({ initialFocusDone: true });
    },
    destroy: () => {
      const { syncClientState, editor } = get();
      if (syncClientState === 'created') {
        console.log('destroy');
        editor?.disconnect();
        editor?.destroy();
        set(initialState);
      }
    },
  }));

export const NotebookStateProvider: FC<NotebookStateProviderProps> = ({
  children,
}) => <Provider createStore={createStore}>{children}</Provider>;

export const useNotebookState = (): NotebookState => {
  return useStore() as NotebookState;
};
