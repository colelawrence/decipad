import { useCallback } from 'react';
import { DropTargetMonitor } from 'react-dnd';
import { findNodePath, getNodeChildren } from '@udecode/plate';
import { MyEditor, MyElement } from '@decipad/editor-types';
import { DragColumnItem } from '../types';
import { getHoverDirection } from '../utils';

export const useFindSwappableColumns = (
  editor: MyEditor,
  {
    column,
    table,
  }: {
    column: MyElement;
    table: MyElement;
  }
) => {
  return useCallback(
    (
      dragItem: DragColumnItem,
      monitor: DropTargetMonitor
    ): [number, number] | null => {
      const path = findNodePath(editor, table);
      if (path) {
        const children = Array.from(getNodeChildren(editor, path));
        const firstRow = children[1];
        if (firstRow) {
          const columns = Array.from(getNodeChildren(editor, firstRow[1]));
          const sourceColumnIndex = columns.findIndex(
            (col) => dragItem.id === (col[0] as MyElement).id
          );
          const targetColumnIndex = columns.findIndex(
            (col) => column.id === (col[0] as MyElement).id
          );
          if (sourceColumnIndex >= 0 && targetColumnIndex >= 0) {
            const direction = getHoverDirection(editor, {
              monitor,
              dragItem,
              element: column,
            });
            let swappableColumns: [number, number] = [
              sourceColumnIndex,
              direction === 'right' ? targetColumnIndex + 1 : targetColumnIndex,
            ];
            if (swappableColumns[0] < swappableColumns[1]) {
              swappableColumns = [swappableColumns[0], swappableColumns[1] - 1];
            }
            if (swappableColumns[0] === swappableColumns[1]) {
              return null;
            }
            return swappableColumns;
          }
        }
      }
      return null;
    },
    [column, editor, table]
  );
};
