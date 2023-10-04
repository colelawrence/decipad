import { slateYjsSymbol } from 'libs/slate-yjs/src/model';
import { UndoManager } from 'yjs';
import { DocSyncEditor } from '.';

export const setupUndo = (editor: DocSyncEditor): DocSyncEditor => {
  let captureTransaction = true;

  const undoManager = new UndoManager(editor.sharedType, {
    trackedOrigins: new Set([slateYjsSymbol]),

    /**
     * Previously, the code for changing the `captureTransaction` was in `withoutCapturingUndo`,
     * However this seemed to create a race condition of sorts, and therefore we have the logic here.
     * We simply change it to true everytime it is false.
     */
    captureTransaction: () => {
      if (captureTransaction) {
        return true;
      }

      captureTransaction = true;
      return false;
    },
    captureTimeout: 200,
  });

  editor.withoutCapturingUndo = (cb: () => void) => {
    captureTransaction = false;
    cb();
  };

  editor.undoManager = undoManager;

  return editor;
};
