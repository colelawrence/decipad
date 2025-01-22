import type { XYCoord } from 'react-dnd';
import { useDragLayer } from 'react-dnd';
import type { DraggableBlockOverlayProps as UIDraggableBlockOverlayProps } from '@decipad/ui';
import { DraggableBlockOverlay as UIDraggableBlockOverlay } from '@decipad/ui';
import type { MyElement } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { useMemo } from 'react';
import { findNode, toDOMNode } from '@udecode/plate-common';
import type { DragItemNode } from '../utils';

export interface DraggableBlockOverlayProps {
  element: MyElement;
  previewHtmlRef: UIDraggableBlockOverlayProps['previewHtmlRef'];
}

export const DraggableBlockOverlay = ({
  element,
  previewHtmlRef,
}: DraggableBlockOverlayProps) => {
  const editor = useMyEditorRef();

  const { currentOffset, item } = useDragLayer<
    {
      currentOffset: XYCoord | null;
      // Contrary to the type of getItem, this can be null
      item: DragItemNode | null;
    },
    DragItemNode
  >((monitor) => ({
    currentOffset: monitor.getSourceClientOffset(),
    item: monitor.getItem(),
  }));

  /**
   * To avoid the overlays for all dragged blocks appearing at the same place,
   * we need to transform them by the vector between the initial positions of
   * the item.id block and the element.id block.
   */
  const transformOffset: XYCoord = useMemo(() => {
    if (!item) return null;

    const getNodePosition = (node: MyElement): XYCoord | null => {
      const domNode = toDOMNode(editor, node);
      if (!domNode) return null;
      const rect = domNode.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    };

    const elementPosition = getNodePosition(element);
    if (!elementPosition) return null;

    const itemEntry = findNode<MyElement>(editor, {
      at: [],
      match: { id: item.id },
    });
    if (!itemEntry) return null;
    const [itemNode] = itemEntry;
    const itemPosition = getNodePosition(itemNode);
    if (!itemPosition) return null;

    return {
      x: elementPosition.x - itemPosition.x,
      y: elementPosition.y - itemPosition.y,
    };
  }, [editor, element, item]) ?? { x: 0, y: 0 };

  if (!currentOffset) return null;

  const position = {
    x: currentOffset.x + transformOffset.x,
    y: currentOffset.y + transformOffset.y,
  };

  return (
    <UIDraggableBlockOverlay
      position={position}
      previewHtmlRef={previewHtmlRef}
    />
  );
};
