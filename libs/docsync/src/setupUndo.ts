import { slateYjsSymbol } from 'libs/slate-yjs/src/model';
import { UndoManager } from 'yjs';
import { DocSyncEditor } from '.';

export const setupUndo = (editor: DocSyncEditor): DocSyncEditor => {
  const undoManager = new UndoManager(editor.sharedType, {
    trackedOrigins: new Set([slateYjsSymbol]),
    captureTimeout: 200,
  });
  editor.undo = () => {
    undoManager.undo();
  };
  editor.redo = () => {
    undoManager.redo();
  };
  editor.undoManager = undoManager;

  return editor;
};
