import {
  EditorBubblesContext,
  ShadowCalcPortal,
  ShadowCalcReference,
} from '@decipad/react-contexts';
import React, {
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react';

type BubbleEditorProps = PropsWithChildren<{}>;

export const BubbleEditor: React.FC<BubbleEditorProps> = ({ children }) => {
  const [portal, setPortalVal] = useState<ShadowCalcPortal>();
  const [editing, setEditingVal] = useState<ShadowCalcReference>();

  const setPortal = useCallback(
    (newPortal: ShadowCalcPortal) => setPortalVal(newPortal),
    [setPortalVal]
  );

  const openEditor = useCallback(
    (ref: ShadowCalcReference) => setEditingVal(ref),
    [setEditingVal]
  );

  const closeEditor = useCallback(
    (codeLineId?: string) =>
      setEditingVal((old) => {
        if (codeLineId == null) return undefined;
        if (old?.codeLineId === codeLineId) return undefined;

        return old;
      }),
    [setEditingVal]
  );

  const value = useMemo(
    () => ({
      portal,
      editing,
      setPortal,
      openEditor,
      closeEditor,
    }),
    [portal, editing, setPortal, openEditor, closeEditor]
  );

  return (
    <EditorBubblesContext.Provider value={value}>
      {children}
    </EditorBubblesContext.Provider>
  );
};
