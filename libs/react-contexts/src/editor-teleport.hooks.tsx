import { TNode, useEditorRef } from '@udecode/plate';
import { useCallback, useRef, useEffect } from 'react';
import { useEditorTeleportContext } from './editor-teleport';

export const useShadowCodeLine = (elementId: string) => {
  const numberRef = useRef<HTMLSpanElement>(null);
  const portalRef = useRef<HTMLSpanElement>(null);

  const editor = useEditorRef();
  const { setPortal, openEditor, editing } = useEditorTeleportContext();

  const isEditing = elementId === editing?.numberId;

  const editSource = useCallback(
    (calcId: string, numberNode: TNode) => {
      if (isEditing) return;

      const codeLine = editor.children.find((ch) => ch.id === calcId);
      if (!codeLine) return;

      openEditor({
        numberNode,
        codeLineNode: codeLine,
        numberId: elementId,
        codeLineId: calcId,
      });
    },
    [editor, isEditing, openEditor, elementId]
  );

  useEffect(() => {
    if (!isEditing) return;

    if (portalRef.current) {
      const number = numberRef.current || { offsetTop: 0, offsetHeight: 0 };

      setPortal({
        element: portalRef.current,
        offsetY: number.offsetTop + number.offsetHeight,
      });
    }
  }, [isEditing, setPortal, portalRef]);

  const portal = (
    <span
      ref={portalRef}
      style={{ display: isEditing ? undefined : 'none' }}
      contentEditable={true}
    />
  );

  return { portal, editSource, numberRef, isEditing };
};
