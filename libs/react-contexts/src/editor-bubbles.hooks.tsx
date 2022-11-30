import { useCallback, useRef, useEffect } from 'react';
import { useEditorBubblesContext } from './editor-bubbles';

export const useShadowCodeLine = (elementId: string) => {
  const numberRef = useRef<HTMLSpanElement>(null);
  const portalRef = useRef<HTMLSpanElement>(null);

  const { setPortal, openEditor, editing } = useEditorBubblesContext();

  const isEditing = elementId === editing?.numberId;

  const editSource = useCallback(
    (calcId: string) => {
      if (isEditing) return;

      openEditor({
        codeLineId: calcId,
        numberId: elementId,
      });
    },
    [isEditing, openEditor, elementId]
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
