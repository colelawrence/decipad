import { useState, useEffect } from 'react';
import { DocSyncEditor } from '@decipad/docsync';

/**
 * Responsively returns if the editor can undo/redo any changes.
 */
export function useEditorUndoState(
  editor: DocSyncEditor | undefined
): [boolean, boolean] {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    // Reset values based on `editor` prop changing.
    setCanUndo(false);
    setCanRedo(false);

    if (editor == null) return;
    if (editor.undoManager == null) return;

    const { undoManager } = editor;

    editor.undoManager.on('stack-item-added', () => {
      setCanUndo(undoManager.canUndo());
    });

    editor.undoManager.on('stack-item-popped', () => {
      setCanRedo(undoManager.canRedo());
    });
  }, [editor]);

  return [canUndo, canRedo];
}
