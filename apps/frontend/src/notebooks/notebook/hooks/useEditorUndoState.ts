import { useState, useEffect } from 'react';
import { MyEditor } from '@decipad/editor-types';

/**
 * Responsively returns if the editor can undo/redo any changes.
 */
export function useEditorUndoState(
  editor: MyEditor | undefined
): [boolean, boolean] {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!editor) return;
    if (!editor.undoManager) return;

    editor.undoManager.on('stack-item-added', () => {
      setCanUndo(!!editor.undoManager?.canUndo());
    });

    editor.undoManager.on('stack-item-popped', () => {
      setCanRedo(!!editor.undoManager?.canRedo());
    });
  }, [editor]);

  return [canUndo, canRedo];
}
