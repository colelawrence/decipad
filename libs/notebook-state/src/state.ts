import { Computer } from '@decipad/computer';
import { DocSyncEditor, DocSyncOptions } from '@decipad/docsync';
import { MyPlatePlugin } from '@decipad/editor-types';
import { Session } from 'next-auth';

interface InitNotebookStateOptions {
  docsync: Omit<DocSyncOptions, 'editor'>;
  plugins: MyPlatePlugin[];
}

export type EnhancedPromise<T> = typeof Promise & {
  resolved?: T;
};

export interface NotebookState {
  notebookLoadedPromise: EnhancedPromise<DocSyncEditor>;
  resolveNotebookLoadedPromise: () => (e: DocSyncEditor) => void;
  notebookId?: string | undefined;
  syncClientState: 'idle' | 'created';
  editor?: DocSyncEditor | undefined;
  computer: Computer | undefined;
  initEditor: (
    notebookId: string,
    options: InitNotebookStateOptions,
    getSession: () => Session | undefined
  ) => void;
  destroy: () => void;
  loadedFromLocal: boolean;
  loadedFromRemote: boolean;
  timedOutLoadingFromRemote: boolean;
  hasLocalChanges: boolean;
  notebookHref?: string;
  hasNotSavedRemotelyInAWhile: boolean;
  setInitialFocusDone: () => void;
  initialFocusDone: boolean;
  destroyed?: boolean;
  isNewNotebook: boolean;
}
