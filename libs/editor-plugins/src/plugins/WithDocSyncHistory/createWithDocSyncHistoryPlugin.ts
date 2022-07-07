/* eslint-disable no-param-reassign */
import type { DocSyncEditor } from '@decipad/docsync';
import { UndoManager } from 'yjs';
import { MyPlatePlugin } from '@decipad/editor-types';
import { slateYjsSymbol } from 'libs/slate-yjs/src/model';

export const createWithDocSyncHistoryPlugin = (): MyPlatePlugin => ({
  key: 'WITH_DOC_SYNC_HISTORY_PLUGIN',
  withOverrides: (_editor) => {
    const editor = _editor as DocSyncEditor;
    if (editor.isDocSyncEnabled) {
      const undoManager = new UndoManager(editor.sharedType, {
        trackedOrigins: new Set([slateYjsSymbol]),
      });
      editor.undo = () => {
        undoManager.undo();
      };
      editor.redo = () => {
        undoManager.redo();
      };
    }

    return editor;
  },
});
