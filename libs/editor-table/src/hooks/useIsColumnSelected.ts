import { findNodePath, isCollapsed } from '@udecode/plate';
import { TableCellElement, TableHeaderElement } from '@decipad/editor-types';
import { Path } from 'slate';
import { useEditorSelector } from '@decipad/react-contexts';
import { useCallback } from 'react';

export const useIsColumnSelected = (
  element: TableCellElement | TableHeaderElement
): boolean => {
  return useEditorSelector(
    useCallback(
      (editor) => {
        const { selection } = editor;
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
                return (
                  selectedSubTablePath >= 2 &&
                  columnIndex === selectedPath[selectedPath.length - 2]
                );
              }
            }
          }
        }
        return false;
      },
      [element]
    )
  );
};
