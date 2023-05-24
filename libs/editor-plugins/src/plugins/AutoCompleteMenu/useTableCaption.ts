import { useSelection } from '@decipad/editor-hooks';
import { ELEMENT_TABLE, useTEditorRef } from '@decipad/editor-types';
import { isElementOfType } from '@decipad/editor-utils';
import { getAboveNode, getNodeString, isCollapsed } from '@udecode/plate';
import { useMemo } from 'react';

export const useTableCaption = (): string | undefined => {
  const editor = useTEditorRef();
  const selection = useSelection();
  return useMemo(() => {
    if (selection && isCollapsed(selection)) {
      const tableAboveEntry = getAboveNode(editor, {
        at: selection.anchor,
        match: { type: ELEMENT_TABLE },
      });
      if (tableAboveEntry) {
        const [tableAbove] = tableAboveEntry;
        if (tableAbove && isElementOfType(tableAbove, ELEMENT_TABLE)) {
          return getNodeString(tableAbove.children[0]?.children[0]);
        }
      }
    }
    return undefined;
  }, [editor, selection]);
};
