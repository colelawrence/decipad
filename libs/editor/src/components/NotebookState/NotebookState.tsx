import { FC, useState, useEffect, useCallback, useContext } from 'react';
import { ClientEventsContext } from '@decipad/client-events';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { useTPlateEditorState } from '@decipad/editor-types';
import { createDefaultNotebook, useIsOffline } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { NotebookState as UINotebookState } from '@decipad/ui';
import { useSession } from 'next-auth/react';
import { removeNodes, withoutNormalizing } from '@udecode/plate';

interface NotebookStateProps {
  isSavedRemotely?: BehaviorSubject<boolean>;
  isNewNotebook: boolean;
}

// In milliseconds
const DEBOUNCE_TIME = 2000;

export const NotebookState: FC<NotebookStateProps> = ({
  isSavedRemotely,
  isNewNotebook,
}) => {
  const [saved, setSaved] = useState(true);
  const session = useSession();

  useEffect(() => {
    const sub = isSavedRemotely
      ?.pipe(debounceTime(DEBOUNCE_TIME))
      .subscribe((newSaved) => setSaved(newSaved));
    return () => sub?.unsubscribe();
  }, [isSavedRemotely]);

  // State editor because this component needs to re-render on state changes.
  const editor = useTPlateEditorState();
  const readOnly = useIsEditorReadOnly();
  const clientEvent = useContext(ClientEventsContext);

  const clearNotebook = useCallback(() => {
    withoutNormalizing(editor, () => {
      editor.children.forEach((_i) => {
        removeNodes(editor, {
          at: [0],
        });
      });
      createDefaultNotebook(editor);
      clientEvent({
        type: 'action',
        action: 'clear all',
      });
    });
  }, [editor, clientEvent]);

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
      clearNotebook={clearNotebook}
      canUndo={canUndo}
      canRedo={canRedo}
      readOnly={readOnly}
      saved={saved}
      isOffline={isOffline}
      isNewNotebook={isNewNotebook}
      authed={session.status === 'authenticated'}
    />
  );
};
