import { Computer } from '@decipad/computer';
import { DocSyncEditor, DocSyncOptions } from '@decipad/docsync';

export interface NotebookState {
  notebookId?: string | undefined;
  syncClientState: 'idle' | 'created';
  docSyncEditor?: DocSyncEditor | undefined;
  computer: Computer | undefined;
  initComputer: () => void;
  initDocSync: (notebookId: string, options: DocSyncOptions) => void;
  destroy: () => void;
  connected: boolean;
  loadedFromLocal: boolean;
  loadedFromRemote: boolean;
  timedOutLoadingFromRemote: boolean;
  hasLocalChanges: boolean;
  notebookHref?: string;
}
