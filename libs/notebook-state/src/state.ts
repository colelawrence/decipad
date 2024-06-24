import type { Session } from 'next-auth';
import type { Computer } from '@decipad/computer-interfaces';
import type { DocSyncEditor, DocSyncOptions } from '@decipad/docsync';
import type { BlockProcessor } from '@decipad/notebook-tabs';
import type { MyPlatePlugin } from '@decipad/editor-types';
import type { LiveConnectionWorker } from '@decipad/live-connect';

interface InitNotebookStateOptions {
  docsync: Omit<DocSyncOptions, 'editor' | 'controller'>;
  plugins: MyPlatePlugin[];
  onChangeTitle: (title: string) => void;
}

export type EnhancedPromise<T> = typeof Promise & {
  resolved?: T;
};

export interface NotebookState {
  notebookLoadedPromise: EnhancedPromise<DocSyncEditor>;
  resolveNotebookLoadedPromise: () => (e: DocSyncEditor) => void;
  blockProcessor: BlockProcessor | undefined;
  notebookId?: string | undefined;
  syncClientState: 'idle' | 'created';
  editor?: DocSyncEditor | undefined;
  computer: Computer | undefined;
  liveConnectionWorker: () => LiveConnectionWorker;
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
