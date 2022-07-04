import { useEffect, useState } from 'react';
import { findNodePath, isCollapsed } from '@udecode/plate';
import {
  TableCellElement,
  TableHeaderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { Path } from 'slate';
import { useSelection } from '@decipad/editor-utils';

export const useIsColumnSelected = (
  element: TableCellElement | TableHeaderElement
): boolean => {
  const editor = useTEditorRef();
  const [isColumnSelected, setIsColumnSelected] = useState(false);
  const selection = useSelection();

  useEffect(() => {
    let selected = false;
    if (selection && isCollapsed(selection)) {
      const path = findNodePath(editor, element);
      if (path) {
        const tablePath = path.slice(0, -2);
        if (tablePath.length) {
          const selectedPath = selection.anchor.path;
          const selectedTablePath = selectedPath.slice(0, -3);
          if (Path.equals(selectedTablePath, tablePath)) {
            const selectedSubTablePath = selectedPath[tablePath.length];
            const columnIndex = path[path.length - 1];
            selected =
              selectedSubTablePath >= 2 &&
              columnIndex === selectedPath[selectedPath.length - 2];
          }
        }
      }
    }

    setIsColumnSelected(selected);
  }, [editor, element, selection]);

  return isColumnSelected;
};
