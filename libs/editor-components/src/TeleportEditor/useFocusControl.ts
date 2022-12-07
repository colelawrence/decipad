import { MyEditor, MyElement, useTEditorRef } from '@decipad/editor-types';
import { focusAndSetSelection, useSelection } from '@decipad/editor-utils';
import { ShadowCalcReference } from '@decipad/react-contexts';
import { findNodePath } from '@udecode/plate';
import { useEffect, useState } from 'react';
import { useSelected } from 'slate-react';

enum FocusStatus {
  Focusing = 'focusing',
  Focused = 'focused',
  None = 'none',
}

/**
 * After initial page load `editor.selection` is not set so `setSelection` does nothing.
 * We use this hack, but further investigation is needed ENG-1465.
 * This way we also make selection differ from the next one, so editorApply is triggered.
 *
 * @see  https://github.com/ianstormtaylor/slate/blob/f55026f0ba4eeea272ab33385ae2a43d3b3d65a0/packages/slate/src/transforms/selection.ts#L190-L192
 * */
const ensureSelectionHack = (editor: MyEditor, force?: boolean) => {
  const { selection } = editor;
  if (!selection || force) {
    const path = [0];
    const hackSelection = {
      anchor: { path, offset: 0 },
      focus: { path, offset: 0 },
    };
    // eslint-disable-next-line no-param-reassign
    editor.selection = hackSelection;
  }
};

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
