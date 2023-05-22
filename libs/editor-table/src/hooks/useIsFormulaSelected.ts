import { useSelection } from '@decipad/editor-hooks';
import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  useTEditorRef,
} from '@decipad/editor-types';
import { isElementOfType } from '@decipad/editor-utils';
import { getNode, isCollapsed } from '@udecode/plate';
import { useMemo } from 'react';

export const useIsFormulaSelected = (headerBlockId: string): boolean => {
  const editor = useTEditorRef();
  const selection = useSelection(true);
  return useMemo(() => {
    if (!selection || !isCollapsed(selection)) {
      return false;
    }
    const path = selection.anchor.path.slice(0, -1);
    const selectedNode = getNode(editor, path);
    return (
      selectedNode != null &&
      isElementOfType(selectedNode, ELEMENT_TABLE_COLUMN_FORMULA) &&
      selectedNode.columnId === headerBlockId
    );
  }, [editor, headerBlockId, selection]);
};
