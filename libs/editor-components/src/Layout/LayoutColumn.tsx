import { FC, useCallback } from 'react';
import {
  ColumnableElement,
  ELEMENT_PARAGRAPH,
  elementKinds,
  useMyEditorRef,
  MyEditor,
} from '@decipad/editor-types';
import {
  LayoutColumnBorderMode,
  LayoutColumn as UILayoutColumn,
  LayoutColumnProps as UILayoutColumnProps,
} from '@decipad/ui';
import {
  hasLayoutAncestor,
  insertNodes,
  isColumnableKind,
  isEmptyColumn,
  minColumnWidth,
  showColumnBorder,
  smartMoveNode,
} from '@decipad/editor-utils';
import { DragItemNode } from '../utils';
import { useDrop } from 'react-dnd';
import {
  createPathRef,
  findNode,
  findNodePath,
  getNode,
  removeNodes,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';
import { nanoid } from 'nanoid';
import { useIsEditorReadOnly } from '@decipad/react-contexts';

/**
 * If dropping onto an empty column in the same layout, leave behind an empty
 * column.
 */
const maybeLeaveBehindEmptyColumn = (
  editor: MyEditor,
  fromPath: Path,
  toPath: Path
) => {
  if (
    hasLayoutAncestor(editor, fromPath) &&
    !Path.equals(fromPath, toPath) &&
    Path.isSibling(fromPath, toPath)
  ) {
    const { columnWidth = 1 } =
      getNode<ColumnableElement>(editor, fromPath) ?? {};

    insertNodes(
      editor,
      [
        {
          type: ELEMENT_PARAGRAPH,
          id: nanoid(),
          columnWidth,
          children: [{ text: '' }],
        },
      ],
      { at: Path.next(fromPath) }
    );
  }
};

interface LayoutColumnProps
  extends Omit<
    UILayoutColumnProps,
    | 'borderMode'
    | 'isDragging'
    | 'isDragOver'
    | 'connectDropTarget'
    | 'minWidth'
  > {
  readonly element: ColumnableElement;
  readonly layoutSelected?: boolean;
}

export const LayoutColumn: FC<LayoutColumnProps> = ({
  element,
  layoutSelected = false,
  ...props
}) => {
  const editor = useMyEditorRef();
  const isEmpty = isEmptyColumn(element);
  const readOnly = useIsEditorReadOnly();

  const borderMode: LayoutColumnBorderMode = (() => {
    if (readOnly) return 'never';
    if (isEmpty) return 'always';
    if (!showColumnBorder(element.type)) return 'never';
    if (layoutSelected) return 'always';
    return 'hover';
  })();

  // Handle dropping onto an empty column
  const onDrop = useCallback(
    (item: DragItemNode) => {
      const dropPath = findNodePath(editor, element);
      if (!dropPath) return;
      const dropPathRef = createPathRef(editor, dropPath);

      const dragEntry = findNode(editor, {
        at: [],
        match: { id: item.id },
      });
      if (!dragEntry) return;
      const [, dragPath] = dragEntry;

      withoutNormalizing(editor, () => {
        maybeLeaveBehindEmptyColumn(editor, dragPath, dropPath);

        // Copy columnWidth from empty column onto dragged node
        setNodes(
          editor,
          {
            columnWidth: element.columnWidth ?? 1,
          },
          {
            at: dragPath,
          }
        );

        smartMoveNode(editor, dragPath, dropPathRef.current!, 'before');
        removeNodes(editor, { at: dropPathRef.unref()! });
      });
    },
    [editor, element]
  );

  const [{ isDragging, isOver, canDrop: rawCanDrop }, drop] = useDrop<
    DragItemNode,
    unknown,
    { isDragging: boolean; isOver: boolean; canDrop: boolean }
  >(
    {
      accept: elementKinds,
      drop: onDrop,
      collect: (monitor) => {
        const item = monitor.getItem() as DragItemNode | null;
        const isSelf = item?.id === element.id;

        return {
          isDragging: !!item,
          isOver: monitor.isOver(),
          canDrop: !!item && !isSelf && isColumnableKind(item.type),
        };
      },
    },
    [onDrop, element.id]
  );

  const canDrop = rawCanDrop && isEmpty;

  const minWidth = minColumnWidth(element.type);

  return (
    <UILayoutColumn
      borderMode={borderMode}
      isDragging={canDrop && isDragging}
      isDragOver={canDrop && isOver}
      connectDropTarget={drop}
      minWidth={minWidth}
      {...props}
    />
  );
};
