import { Computer } from '@decipad/computer';
import { DocSyncEditor, DocSyncOptions } from '@decipad/docsync';
import { MyEditor } from '@decipad/editor-types';

export interface NotebookState {
  notebookId?: string | undefined;
  syncClientState: 'idle' | 'created';
  docSyncEditor?: DocSyncEditor | undefined;
  computer: Computer | undefined;
  init: (editor: MyEditor, notebookId: string, options: DocSyncOptions) => void;
  destroy: () => void;
  connected: boolean;
  loadedFromLocal: boolean;
  loadedFromRemote: boolean;
  timedOutLoadingFromRemote: boolean;
  hasLocalChanges: boolean;
}
