import { createDocSyncEditor } from '@decipad/docsync';
import { FC, ReactNode } from 'react';
import create from 'zustand';
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
  'initComputer' | 'initEditor' | 'destroy'
> = {
  syncClientState: 'idle',
  editor: undefined,
  computer: undefined,
  connected: false,
  loadedFromLocal: false,
  loadedFromRemote: false,
  timedOutLoadingFromRemote: false,
  hasLocalChanges: false,
};

const createStore = () =>
  create<NotebookState>((set, get) => ({
    ...initialState,
    initComputer: () => {
      set({ computer: new Computer() });
    },
    initEditor: (notebookId, { plugins, docsync }) => {
      // verify that if we have a matching connected docsync instance
      const { editor: oldEditor, syncClientState } = get();
      if (oldEditor) {
        if (syncClientState === 'created' && oldEditor.id === notebookId) {
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
      const docSyncEditor = createDocSyncEditor(notebookId, {
        ...docsync,
        editor,
        onError: captureException,
      });
      docSyncEditor.onConnected(() => {
        set({ connected: true });
      });
      docSyncEditor.onDisconnected(() => {
        set({ connected: false });
      });
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
        connected: false,
        loadedFromLocal: false,
        loadedFromRemote: false,
        timedOutLoadingFromRemote: false,
        hasLocalChanges: false,
      });
    },
    destroy: () => {
      const { syncClientState, editor } = get();
      if (syncClientState === 'created') {
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
