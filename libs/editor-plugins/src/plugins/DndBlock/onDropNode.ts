import {
  ELEMENT_LAYOUT,
  LayoutElement,
  type MyEditor,
} from '@decipad/editor-types';
import type { DropTargetMonitor } from 'react-dnd';
import type { DragItemNode } from '@decipad/editor-components';
import {
  hasLayoutAncestor,
  wrapIntoLayout,
  smartMoveNode,
  smartMoveNodes,
  findPathById,
} from '@decipad/editor-utils';
import { getDropLocationForMonitor } from './getDropLocationForMonitor';
import {
  createPathRef,
  getNodeEntries,
  isElement,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { getDraggingIds } from './getDraggingIds';
import type { DropLine } from './types';

export const onDropNode = (
  editor: MyEditor,
  item: DragItemNode,
  monitor: DropTargetMonitor
) => {
  const dropLocation = getDropLocationForMonitor(editor, monitor);
  if (!dropLocation) return;

  if (dropLocation.type === 'verticalDropLine') {
    onDropNodeVertical(editor, item, dropLocation);
  } else if (dropLocation.type === 'horizontalDropLine') {
    onDropNodeHorizontal(editor, item, dropLocation);
  } else if (dropLocation.type === 'dropArea') {
    onDropNodeArea(editor, item);
  }
};

const onDropNodeHorizontal = (
  editor: MyEditor,
  item: DragItemNode,
  dropLine: DropLine
) => {
  const draggingIds = getDraggingIds(item);

  const draggingPaths = Array.from(
    getNodeEntries(editor, {
      match: (n) => isElement(n) && draggingIds.includes(n.id as string),
      at: [],
    }),
    ([, path]) => path
  );

  smartMoveNodes(editor, draggingPaths, dropLine.path, dropLine.direction);
};

const onDropNodeVertical = (
  editor: MyEditor,
  item: DragItemNode,
  dropLine: DropLine
) => {
  const dragPath = findPathById(editor, item.id);
  if (!dragPath) return;

  const originalDropPath = dropLine.path;

  /**
   * Using a path ref means that the path will be updated even if the node is
   * wrapped in a new layout.
   */
  const dropPathRef = createPathRef(editor, originalDropPath);

  withoutNormalizing(editor, () => {
    // Wrap the node in a layout if it isn't already in one
    if (!hasLayoutAncestor(editor, originalDropPath)) {
      wrapIntoLayout(editor, originalDropPath);
    }

    smartMoveNode(editor, dragPath, dropPathRef.unref()!, dropLine.direction);
  });
};

const onDropNodeArea = (editor: MyEditor, item: DragItemNode) => {
  const dragPath = findPathById(editor, item.id);
  if (!dragPath) return;

  if (item.type === ELEMENT_LAYOUT) {
    setNodes(editor, { width: 'full' } satisfies Partial<LayoutElement>, {
      at: dragPath,
    });
  } else {
    wrapIntoLayout(editor, dragPath, 'full');
  }
};
