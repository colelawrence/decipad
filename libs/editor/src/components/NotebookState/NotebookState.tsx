import { FC, useState, useEffect, useCallback } from 'react';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { useTPlateEditorState } from '@decipad/editor-types';
import { useIsOffline } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { NotebookState as UINotebookState } from '@decipad/ui';

interface NotebookStateProps {
  isSavedRemotely: BehaviorSubject<boolean>;
}

// In milliseconds
const DEBOUNCE_TIME = 2000;

export const NotebookState: FC<NotebookStateProps> = ({ isSavedRemotely }) => {
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const sub = isSavedRemotely
      .pipe(debounceTime(DEBOUNCE_TIME))
      .subscribe((newSaved) => setSaved(newSaved));
    return () => sub.unsubscribe();
  }, [isSavedRemotely]);

  // State editor because this component needs to re-render on state changes.
  const editor = useTPlateEditorState();
  const readOnly = useIsEditorReadOnly();

  const canUndo = !!editor.undoManager?.canUndo?.();
  const canRedo = !!editor.undoManager?.canRedo?.();

  const revertChanges = useCallback(() => {
    while (editor.undoManager?.canUndo?.()) {
      editor.undo();
    }
  }, [editor]);

  const { isOffline } = useIsOffline();

  return (
    <UINotebookState
      undo={editor.undo}
      redo={editor.redo}
      revertChanges={revertChanges}
      canUndo={canUndo}
      canRedo={canRedo}
      readOnly={readOnly}
      saved={saved}
      isOffline={isOffline}
    />
  );
};
