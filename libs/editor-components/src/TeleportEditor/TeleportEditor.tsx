import { MyEditor } from '@decipad/editor-types';
import { focusAndSetSelection } from '@decipad/editor-utils';
import {
  EditorTeleportContext,
  ShadowCalcPortal,
  ShadowCalcReference,
} from '@decipad/react-contexts';
import { findNodePath } from '@udecode/plate';
import React, {
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useFocusControl } from './useFocusControl';

type TeleportEditorProps = PropsWithChildren<{ editor: MyEditor }>;

export const TeleportEditor: React.FC<TeleportEditorProps> = ({
  children,
  editor,
}) => {
  const [portal, setPortal] = useState<ShadowCalcPortal>();
  const [editing, setEditing] = useState<ShadowCalcReference>();

  const focusNumber = useCallback(() => {
    const node = editing?.numberNode;
    const path = node ? findNodePath(editor, node) : null;

    if (path) {
      focusAndSetSelection(editor, path);
    }
  }, [editor, editing?.numberNode]);

  const closeEditor = useCallback(
    (codeLineId?: string, onClose?: () => void) =>
      setEditing((old) => {
        const anyCodeLine = codeLineId == null;
        const matchingCodeLine = old?.codeLineId === codeLineId;

        const shouldClose = anyCodeLine || matchingCodeLine;

        if (shouldClose) {
          onClose?.();
          return undefined;
        }

        return old;
      }),
    [setEditing]
  );

  const { useWatchTeleported } = useFocusControl(editing, closeEditor);

  const onBlur = useCallback(() => {
    closeEditor();
    focusNumber();
  }, [closeEditor, focusNumber]);

  const value = useMemo(
    () => ({
      portal,
      editing,
      setPortal,
      focusNumber,
      closeEditor,
      openEditor: setEditing,
      useWatchTeleported,
    }),
    [
      portal,
      editing,
      setPortal,
      setEditing,
      focusNumber,
      closeEditor,
      useWatchTeleported,
    ]
  );

  return (
    <EditorTeleportContext.Provider value={value}>
      <span onBlur={onBlur}>{children}</span>
    </EditorTeleportContext.Provider>
  );
};
