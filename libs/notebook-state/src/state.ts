import { Computer } from '@decipad/computer';
import { DocSyncEditor, DocSyncOptions } from '@decipad/docsync';
import { MyPlatePlugin } from '@decipad/editor-types';

interface InitNotebookStateOptions {
  docsync: Omit<DocSyncOptions, 'editor'>;
  plugins: MyPlatePlugin[];
}

export interface NotebookState {
  notebookId?: string | undefined;
  syncClientState: 'idle' | 'created';
  editor?: DocSyncEditor | undefined;
  computer: Computer | undefined;
  initComputer: () => void;
  initEditor: (notebookId: string, options: InitNotebookStateOptions) => void;
  destroy: () => void;
  connected: boolean;
  loadedFromLocal: boolean;
  loadedFromRemote: boolean;
  timedOutLoadingFromRemote: boolean;
  hasLocalChanges: boolean;
  notebookHref?: string;
  setInitialFocusDone: () => void;
  initialFocusDone: boolean;
}
