import { DraggableBlock, defaultMoveNode } from '@decipad/editor-components';
import { COLUMN_KINDS, MyEditor, MyElement } from '@decipad/editor-types';
import { wrapIntoColumns } from '@decipad/editor-utils';
import { findNode, moveNodes, withoutNormalizing } from '@udecode/plate';
import { ComponentProps, useCallback } from 'react';
import { Path } from 'slate';
import { DropTargetMonitor } from 'react-dnd';
import { Axis, DragItemNode } from '../utils/useDnd';

interface useDragAndDropGetAxisProps {
  isHorizontal?: boolean;
}
interface useDragAndDropOnDropProps {
  path?: Path;
  isHorizontal?: boolean;
  editor: MyEditor;
  element: MyElement;
}

export const useDragAndDropGetAxis = ({
  isHorizontal,
}: useDragAndDropGetAxisProps) => {
  const getAxis = useCallback<
    NonNullable<ComponentProps<typeof DraggableBlock>['getAxis']>
  >(
    (_, monitor) => ({
      horizontal: COLUMN_KINDS.includes(
        (monitor.getItemType()?.toString() as string) || ''
      ),
      vertical: !isHorizontal,
    }),
    [isHorizontal]
  );

  return getAxis as (
    item: DragItemNode,
    monitor: DropTargetMonitor<DragItemNode, unknown>
  ) => Axis;
};

export const useDragAndDropOnDrop = ({
  editor,
  element,
  path,
  isHorizontal,
}: useDragAndDropOnDropProps) => {
  return useCallback<
    NonNullable<ComponentProps<typeof DraggableBlock>['onDrop']>
  >(
    (item, _, direction) => {
      if (!path || (direction !== 'left' && direction !== 'right')) {
        return defaultMoveNode(editor, item, element.id, direction);
      }

      withoutNormalizing(editor, () => {
        const dragPath = findNode(editor, {
          at: [],
          match: { id: item.id },
        })?.[1];
        let dropPath: Path = [];

        if (isHorizontal) {
          if (direction === 'left') {
            dropPath = path;
          }
          if (direction === 'right') {
            dropPath = Path.next(path);
          }
        } else {
          dropPath = [...path, direction === 'left' ? 0 : 1];
          wrapIntoColumns(editor, path);
        }

        moveNodes(editor, { at: dragPath, to: dropPath });
      });
    },
    [editor, element.id, isHorizontal, path]
  );
};
