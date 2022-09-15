import { createDocSyncEditor, DocSyncOptions } from '@decipad/docsync';
import { MyEditor } from '@decipad/editor-types';
import { FC, ReactNode } from 'react';
import create from 'zustand';
import createContext from 'zustand/context';
import { captureException } from '@sentry/browser';
import { take } from 'rxjs';
import { Computer } from '@decipad/computer';
import { NotebookState } from './state';

interface NotebookStateProviderProps {
  children?: ReactNode;
}

const { Provider, useStore } = createContext();
const LOAD_TIMEOUT_MS = 5000;

const initialState: Omit<NotebookState, 'init' | 'destroy'> = {
  syncClientState: 'idle',
  docSyncEditor: undefined,
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
    init: (editor: MyEditor, notebookId: string, options: DocSyncOptions) => {
      // if (get().syncClientState === 'idle') {
      const loadTimeout = setTimeout(() => {
        set({ timedOutLoadingFromRemote: true });
      }, LOAD_TIMEOUT_MS);
      const docSyncEditor = createDocSyncEditor(editor, notebookId, {
        ...options,
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
        docSyncEditor,
        syncClientState: 'created',
        computer: new Computer(),
      });
      // }
    },
    destroy: () => {
      const { syncClientState, docSyncEditor } = get();
      if (syncClientState === 'created') {
        docSyncEditor?.disconnect();
        docSyncEditor?.destroy();
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
