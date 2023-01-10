import { slateYjsSymbol } from 'libs/slate-yjs/src/model';
import { UndoManager } from 'yjs';
import { DocSyncEditor } from '.';

export const setupUndo = (editor: DocSyncEditor): DocSyncEditor => {
  let captureTransaction = true;
  const undoManager = new UndoManager(editor.sharedType, {
    trackedOrigins: new Set([slateYjsSymbol]),
    captureTransaction: () => captureTransaction,
    captureTimeout: 200,
  });
  editor.undo = () => {
    undoManager.undo();
  };
  editor.redo = () => {
    undoManager.redo();
  };
  editor.withoutCapturingUndo = (cb: () => void) => {
    const beforeCapturing = captureTransaction;
    captureTransaction = false;
    try {
      cb();
    } finally {
      captureTransaction = beforeCapturing;
    }
  };
  editor.undoManager = undoManager;

  return editor;
};
