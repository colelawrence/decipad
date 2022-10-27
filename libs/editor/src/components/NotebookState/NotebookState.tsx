import { FC, useState, useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import { useTEditorState } from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { NotebookState as UINotebookState } from '@decipad/ui';

interface NotebookStateProps {
  isSavedRemotely: BehaviorSubject<boolean>;
}

export const NotebookState: FC<NotebookStateProps> = ({ isSavedRemotely }) => {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sub = isSavedRemotely.subscribe((newSaved) => setSaved(newSaved));
    return () => sub.unsubscribe();
  }, [isSavedRemotely]);

  const editor = useTEditorState();
  const readOnly = useIsEditorReadOnly();

  const canUndo = !!editor.undoManager?.canUndo?.();
  const canRedo = !!editor.undoManager?.canRedo?.();

  const revertChanges = () => {
    while (editor.undoManager?.canUndo?.()) {
      editor.undo();
    }
  };

  return (
    <UINotebookState
      undo={editor.undo}
      redo={editor.redo}
      revertChanges={revertChanges}
      canUndo={canUndo}
      canRedo={canRedo}
      readOnly={readOnly}
      saved={saved}
    />
  );
};
