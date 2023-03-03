import { TNode, useEditorRef } from '@udecode/plate';
import { useCallback, useEffect, useRef } from 'react';
import { useEditorTeleportContext } from './editor-teleport';

export const useShadowCodeLine = (elementId: string) => {
  const numberRef = useRef<HTMLSpanElement>(null);
  const portalRef = useRef<HTMLSpanElement>(null);

  const editor = useEditorRef();
  const { setPortal, openEditor, editing } = useEditorTeleportContext();

  const isEditing = elementId === editing?.numberId;

  const editSource = useCallback(
    (calcId: string, numberNode: TNode) => {
      if (isEditing) return false;

      const codeLine = editor.children.find((ch) => {
        return ch.id === calcId && ch.type.includes('code_line');
      });

      if (!codeLine) return false;

      openEditor({
        numberNode,
        codeLineNode: codeLine,
        numberId: elementId,
        codeLineId: calcId,
      });

      return true;
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
