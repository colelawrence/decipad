import type {
  AnyElement,
  MyEditor,
  MyElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { getNodeChildren, isElement } from '@udecode/plate-common';
import type { Path } from 'slate';
import type { DropTargetMonitor } from 'react-dnd';
import type { DragColumnItem } from '../types';
import { getHoverDirection } from './getHoverDirection';

export const findSwappableColumns = (
  {
    editor,
    column,
    tablePath,
  }: {
    editor: MyEditor;
    column: MyElement;
    tablePath: Path | undefined;
  },
  dragItem: DragColumnItem | TableHeaderElement,
  monitor: DropTargetMonitor,
  hoverDirection?: 'left' | 'right'
): [number, number] | null => {
  if (!tablePath) return null;

  const children = Array.from(getNodeChildren(editor, tablePath));
  const firstRow = children[1];
  if (!firstRow) {
    return null;
  }
  const columns = Array.from(getNodeChildren(editor, firstRow[1]));
  const sourceColumnIndex = columns.findIndex(
    (col) => dragItem.id === (col[0] as AnyElement).id
  );
  const targetColumnIndex = isElement(column)
    ? columns.findIndex((col) => column.id === (col[0] as AnyElement).id ?? '')
    : -1;
  if (sourceColumnIndex >= 0 && targetColumnIndex >= 0) {
    const direction =
      hoverDirection ||
      getHoverDirection(editor, {
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

    return swappableColumns;
  }
  return null;
};
