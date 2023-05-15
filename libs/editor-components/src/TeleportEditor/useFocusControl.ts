import { MyElement, useTEditorRef } from '@decipad/editor-types';
import { focusAndSetSelection } from '@decipad/editor-utils';
import { useSelection } from '@decipad/editor-hooks';
import { ShadowCalcReference } from '@decipad/react-contexts';
import { findNodePath } from '@udecode/plate';
import { useEffect, useState } from 'react';
import { useSelected } from 'slate-react';
import { ensureSelectionHack } from './ensureSelectionHack';
import { useDeletionTrap } from './useDeletionTrap';
import { useSelectionTrap } from './useSelectionTrap';

enum FocusStatus {
  Focusing = 'focusing',
  Focused = 'focused',
  None = 'none',
}

export const useFocusControl = (
  editing?: ShadowCalcReference,
  closeEditor?: (id: string) => void
) => {
  const [focusState, setFocusState] = useState<FocusStatus>(FocusStatus.None);

  const useWatchTeleported = (elementId: string, element: MyElement) => {
    const editor = useTEditorRef();
    const selection = useSelection();
    const selected = useSelected();

    const isTeleported = elementId === editing?.codeLineId;
    const shouldBeFocused = isTeleported && focusState === FocusStatus.None;

    const anchorRoot = selection?.anchor?.path[0];
    const focusRoot = selection?.focus?.path[0];
    const isInsideBlock = selected && isTeleported && anchorRoot === focusRoot;

    const shouldBeBlurred =
      !isInsideBlock &&
      focusState === FocusStatus.Focused &&
      elementId === editing?.codeLineId;

    const shouldPreventArrowKeys =
      isTeleported && focusState === FocusStatus.Focused;

    const shouldPreventDeletion = isTeleported && isInsideBlock;

    useSelectionTrap(editor, shouldPreventArrowKeys);
    useDeletionTrap(shouldPreventDeletion);

    useEffect(() => {
      if (!isTeleported) {
        setFocusState(FocusStatus.None);
      }
    }, [isTeleported]);

    useEffect(() => {
      if (!shouldBeFocused) return;

      const path = findNodePath(editor, element);

      if (path) {
        setFocusState(FocusStatus.Focusing);
        ensureSelectionHack(editor, true);
        focusAndSetSelection(editor, path);
      }
    }, [shouldBeFocused, editor, element]);

    useEffect(() => {
      if (!isInsideBlock) return;

      setFocusState(FocusStatus.Focused);
    }, [isInsideBlock]);

    useEffect(() => {
      if (!shouldBeBlurred) return;

      setFocusState(FocusStatus.None);
      closeEditor?.(elementId);
    }, [elementId, shouldBeBlurred]);
  };

  return { focusState, useWatchTeleported };
};
