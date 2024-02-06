import {
  findNodePath,
  useEditorRef,
  useEditorSelection,
  useElement,
} from '@udecode/plate-common';
import { useMemo } from 'react';
import { Path } from 'slate';

export const useCellAnchor = () => {
  /**
   * TODO: Subscribing to the selection causes all cells to rerender when the
   * selection changes. After upgrading Plate to >= 28.0.0, useEditorSelector
   * will become available and should be used instead.
   */
  const editor = useEditorRef();
  const selection = useEditorSelection();
  const element = useElement();

  return useMemo(() => {
    if (!selection) return false;
    const path = findNodePath(editor, element);
    if (!path) return false;
    return Path.isAncestor(path, selection.anchor.path);
  }, [editor, element, selection]);
};
