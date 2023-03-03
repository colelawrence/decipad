import {
  ElementKind,
  elementKinds,
  MyEditor,
  MyElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  createPathRef,
  createStore,
  findNode,
  findNodePath,
  focusEditor,
  getNode,
  getNodeEntries,
  isElement,
  moveNodes,
  withoutNormalizing,
} from '@udecode/plate';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DropTargetMonitor, useDrop, XYCoord } from 'react-dnd';
import { Path, PathRef } from 'slate';
import {
  blockSelectionActions,
  blockSelectionSelectors,
} from '@udecode/plate-selection';
import { getAnalytics } from '@decipad/client-events';
import {
  dndStore as plateDndStore,
  useDragNode,
  UseDropNodeOptions,
} from '@udecode/plate-ui-dnd';

export declare type DropDirection =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | undefined;

type ChangeDropDirection = (direction: DropDirection) => void;

interface DragItemNode {
  id: string;
  selectedIds: Set<string>;
  type: ElementKind;
  [key: string]: unknown;
}

interface Axis {
  horizontal?: boolean;
  vertical?: boolean;
}

export interface UseDndNodeOptions extends Pick<UseDropNodeOptions, 'nodeRef'> {
  accept?: UseDropNodeOptions['accept'];
  element: MyElement;
  previewRef?: any;
  getAxis?: (
    item: DragItemNode,
    monitor: DropTargetMonitor<DragItemNode>
  ) => Axis;
  onDrop?: (
    item: DragItemNode,
    monitor: DropTargetMonitor<DragItemNode>,
    direction: DropDirection
  ) => void;
}

const DEFAULT_AXIS: Axis = { horizontal: false, vertical: true };

export const dndStore = createStore('dnd')({
  draggingIds: new Set<string>(),
  canDrop: false,
});

export const useDnd = ({
  accept = elementKinds,
  nodeRef,
  element,
  previewRef = nodeRef,
  getAxis = () => DEFAULT_AXIS,
  onDrop,
}: UseDndNodeOptions) => {
  const { id, type } = element;

  const editor = useTEditorRef();
  const elementRef = useRef<MyElement>(element);
  elementRef.current = element;

  const [dropLine, setDropLine] = useState<DropDirection>();

  const [{ isDragging }, dragRef, preview] = useDragNode(editor, {
    id,
    type,
    item: () => {
      const selectedIds = blockSelectionSelectors.selectedIds();

      if (blockSelectionSelectors.isSelecting() && !selectedIds.has(id)) {
        blockSelectionActions.unselect();
      }

      return {
        id,
        type,
        selectedIds,
        // The `item` object is set only once when the component renders so we need `getPath` to be
        // a function to account for path changes.
        getPath: () => findNodePath(editor, elementRef.current),
      };
    },
  });

  useEffect(() => {
    if (isDragging) {
      dndStore.set.draggingIds(
        blockSelectionSelectors.selectedIds() as Set<string>
      );
    } else {
      dndStore.set.draggingIds(new Set<string>());
    }
  }, [isDragging]);

  const [{ canDrop, isOver }, drop] = useDrop<
    DragItemNode,
    unknown,
    { canDrop: boolean; isOver: boolean }
  >(
    {
      accept,
      drop: (item, monitor) => {
        onDropNode(editor, {
          id,
          dragItem: item,
          monitor,
          onDrop,
          direction: getDirection({
            dragItem: item,
            monitor,
            nodeRef,
            id,
            axis: getAxis(item, monitor),
          }),
        });
      },
      collect: (monitor) => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver(),
      }),
      hover: (item: DragItemNode, monitor: DropTargetMonitor) => {
        onHoverNode({
          nodeRef,
          id,
          dropLine,
          onChangeDropLine: setDropLine,
          dragItem: item,
          monitor,
          axis: getAxis(item, monitor),
        });
      },
      canDrop: (item, monitor) => {
        return !!getDirection({
          dragItem: item,
          monitor,
          nodeRef,
          id,
          axis: getAxis(item, monitor),
        });
      },
    },
    [getAxis, id, onDrop, type]
  );

  if (previewRef) {
    drop(nodeRef);
    preview(previewRef);
  } else {
    preview(drop(nodeRef));
  }

  if (!isOver && dropLine) {
    // Cleanup if dragged item is not over this drop target anymore
    setDropLine(undefined);
  }

  return {
    canDrop,
    isDragging,
    isOver,
    dropLine,
    dragRef,
  };
};

export const onDropNode = (
  editor: MyEditor,
  {
    id,
    dragItem,
    monitor,
    onDrop,
    direction,
  }: {
    id: MyElement['id'];
    dragItem: DragItemNode;
    monitor: DropTargetMonitor;
    direction: DropDirection;
  } & Pick<UseDndNodeOptions, 'onDrop'>
) => {
  if (!direction || monitor.didDrop()) {
    // No direction or a nested target has already handled the drop.
    return;
  }

  focusEditor(editor);

  onDrop?.(dragItem, monitor, direction) ??
    defaultMoveNode(editor, dragItem, id, direction);
};

export const defaultMoveNode = (
  editor: MyEditor,
  dragItem: DragItemNode,
  id: MyElement['id'],
  direction: DropDirection
) => {
  const { selectedIds, id: dragId } = dragItem;
  let dropId = id;

  const pathRefs: PathRef[] = [];

  if (selectedIds.has(dragId)) {
    const entries = [
      ...getNodeEntries(editor, {
        match: (n) => isElement(n) && selectedIds.has(n.id),
        at: [],
      }),
    ];

    entries.forEach(([, path]) => {
      pathRefs.push(createPathRef(editor, path));
    });
  } else {
    const entry = findNode(editor, { at: [], match: { id: dragId } });
    if (!entry) return;
    const [, path] = entry;

    pathRefs.push(createPathRef(editor, path));
  }

  withoutNormalizing(editor, () => {
    let dropPath: Path | undefined;

    pathRefs.forEach((pathRef) => {
      const path = pathRef.unref();
      if (!path) return;

      const dragNode = getNode<MyElement>(editor, path);
      if (!dragNode) return;

      if (direction === 'bottom') {
        dropPath = findNode(editor, { at: [], match: { id: dropId } })?.[1];
        if (!dropPath) return;

        // if dropping at the same path as the drag node, skip it
        if (Path.equals(path, Path.next(dropPath))) {
          const nextNode = getNode<MyElement>(editor, path);
          if (!nextNode) return;

          // the next node should be moved after it
          dropId = nextNode.id;
          return;
        }

        // the next node should be moved after it
        dropId = dragNode.id;
      }

      if (direction === 'top') {
        const nodePath = findNode(editor, {
          at: [],
          match: { id: dropId },
        })?.[1];
        if (!nodePath) return;

        dropPath = [
          ...nodePath.slice(0, -1),
          nodePath[nodePath.length - 1] - 1,
        ];

        if (Path.equals(path, dropPath)) return;
      }

      if (!dropPath) return;

      const before =
        Path.isBefore(path, dropPath) && Path.isSibling(path, dropPath);
      const to = before ? dropPath : Path.next(dropPath);

      moveNodes(editor, {
        at: path,
        to,
      });

      const analytics = getAnalytics();
      if (analytics) {
        analytics.track('move block');
      }
    });
  });
};

const onHoverNode = ({
  axis,
  dragItem,
  dropLine,
  monitor,
  onChangeDropLine,
  id,
  nodeRef,
}: {
  axis: Axis;
  dragItem: DragItemNode;
  dropLine: DropDirection;
  monitor: DropTargetMonitor;
  onChangeDropLine: ChangeDropDirection;
} & Pick<UseDndNodeOptions, 'nodeRef'> &
  Pick<MyElement, 'id'>) => {
  const isOverCurrent = monitor.isOver({ shallow: true });

  // The `onHoverNode` method is called even if `canDrop()` is false, so we need to double check if
  // it can be dropped before doing any side effects.
  if (!monitor.canDrop()) {
    onChangeDropLine(undefined);
    if (isOverCurrent) {
      // eslint-disable-next-line no-param-reassign
      dragItem.direction = undefined;
    }
    return;
  }

  const direction = getDirection({
    dragItem,
    monitor,
    nodeRef,
    id,
    axis,
  });

  if (direction !== dropLine) {
    onChangeDropLine(direction);
  }

  if (!isOverCurrent && dragItem.direction) {
    onChangeDropLine(undefined);
  }

  if (isOverCurrent) {
    // HACK: In case of nested drop targets with available directions, it avoids showing them all.
    // By keeping track of the inner-most hovered drop target's direction, we can guarantee only
    // this direction will be displayed to the user. Only when this target has no drop direction
    // available will the outer target directions be displayed.
    // eslint-disable-next-line no-param-reassign
    dragItem.direction = direction;
  }
};

export const getDirection = ({
  dragItem,
  id,
  monitor,
  nodeRef,
  axis,
}: {
  dragItem: DragItemNode;
  id: string;
  monitor: DropTargetMonitor;
  nodeRef: any;
  axis: Axis;
}): DropDirection => {
  if (!nodeRef.current) return;

  const dragId = dragItem.id;

  // Don't replace items with themselves
  if (dragId === id) return;

  // Determine rectangle on screen
  const hoverBoundingRect = nodeRef.current?.getBoundingClientRect();

  // Get vertical middle
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

  // Determine mouse position
  const clientOffset = monitor.getClientOffset();
  if (!clientOffset) return;

  // Get pixels to the top
  const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
  const hoverClientLeft = (clientOffset as XYCoord).x - hoverBoundingRect.left;
  const hoverClientRigt = hoverBoundingRect.right - (clientOffset as XYCoord).x;

  // Horizontal direction is only returned up 20 pixels close to the edge.
  if (axis.horizontal && hoverClientLeft < 20) {
    return 'left';
  }

  if (axis.horizontal && hoverClientRigt < 20) {
    return 'right';
  }

  // Vertical direction is returned when the mouse has crossed half of the item's height.
  if (axis.vertical && hoverClientY < hoverMiddleY) {
    return 'top';
  }

  if (axis.vertical && hoverClientY >= hoverMiddleY) {
    return 'bottom';
  }

  return undefined;
};

export const useOnDragEnd = () => {
  return useCallback(() => plateDndStore.set.isDragging(false), []);
};
