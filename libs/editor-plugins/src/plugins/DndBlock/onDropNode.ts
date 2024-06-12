import type { MyEditor } from '@decipad/editor-types';
import type { DropTargetMonitor } from 'react-dnd';
import type { DragItemNode } from '@decipad/editor-components';
import { hasLayoutAncestor, wrapIntoColumns } from '@decipad/editor-utils';
import { getDropLineForMonitor } from './getDropLineForMonitor';
import {
  createPathRef,
  findNode,
  getNodeEntries,
  isElement,
  withoutNormalizing,
} from '@udecode/plate-common';
import { getAnalytics } from '@decipad/client-events';
import { getDraggingIds } from './getDraggingIds';
import { smartMoveNode, smartMoveNodes } from './smartMoveNodes';
import type { DropLine } from './types';

export const onDropNode = (
  editor: MyEditor,
  item: DragItemNode,
  monitor: DropTargetMonitor
) => {
  const dropLine = getDropLineForMonitor(editor, monitor);
  if (!dropLine) return;

  if (dropLine.type === 'vertical') {
    onDropNodeVertical(editor, item, dropLine);
  } else {
    onDropNodeHorizontal(editor, item, dropLine);
  }
};

export const onDropNodeHorizontal = (
  editor: MyEditor,
  item: DragItemNode,
  dropLine: DropLine
) => {
  const draggingIds = getDraggingIds(item);

  const draggingPaths = Array.from(
    getNodeEntries(editor, {
      match: (n) => isElement(n) && draggingIds.includes(n.id),
      at: [],
    }),
    ([, path]) => path
  );

  smartMoveNodes(editor, draggingPaths, dropLine.path, dropLine.direction);

  getAnalytics().then((analytics) => analytics?.track('move block'));
};

export const onDropNodeVertical = (
  editor: MyEditor,
  item: DragItemNode,
  dropLine: DropLine
) => {
  const dragEntry = findNode(editor, {
    at: [],
    match: { id: item.id },
  });
  if (!dragEntry) return;
  const [, dragPath] = dragEntry;

  const originalDropPath = dropLine.path;

  /**
   * Using a path ref means that the path will be updated even if the node is
   * wrapped in a new column.
   */
  const dropPathRef = createPathRef(editor, originalDropPath);

  withoutNormalizing(editor, () => {
    // Wrap the node in a column if it isn't already in one
    if (!hasLayoutAncestor(editor, originalDropPath)) {
      wrapIntoColumns(editor, originalDropPath);
    }

    smartMoveNode(editor, dragPath, dropPathRef.unref()!, dropLine.direction);
  });
};
