import { createDocSyncEditor, DocSyncOptions } from '@decipad/docsync';
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

const initialState: Omit<
  NotebookState,
  'initComputer' | 'initDocSync' | 'destroy'
> = {
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
    initComputer: () => {
      set({ computer: new Computer() });
    },
    initDocSync: (notebookId: string, options: DocSyncOptions) => {
      // verify that if we have a matching connected docsync instance
      const { docSyncEditor: oldDocSyncEditor, syncClientState } = get();
      if (oldDocSyncEditor) {
        if (
          syncClientState === 'created' &&
          oldDocSyncEditor.id === notebookId
        ) {
          // the one we have is just fine
          return;
        }
        try {
          oldDocSyncEditor.disconnect();
          oldDocSyncEditor.destroy();
        } catch (err) {
          console.error('error destroying old docsync instance', err);
        }
      }

      const loadTimeout = setTimeout(() => {
        set({ timedOutLoadingFromRemote: true });
      }, LOAD_TIMEOUT_MS);
      const docSyncEditor = createDocSyncEditor(notebookId, {
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
