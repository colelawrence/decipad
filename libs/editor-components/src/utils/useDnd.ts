import type { ElementKind, MyElement } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { createZustandStore, findNodePath } from '@udecode/plate-common';
import { useCallback, useEffect, useRef /* useState */ } from 'react';
import {
  blockSelectionActions,
  blockSelectionSelectors,
} from '@udecode/plate-selection';
import { dndStore as plateDndStore, useDragNode } from '@udecode/plate-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

export interface DragItemNode {
  id: string;
  selectedIds: Set<string>;
  type: ElementKind;
  [key: string]: unknown;
}

export interface Axis {
  horizontal?: boolean;
  vertical?: boolean;
}

export interface UseDndNodeOptions {
  element: MyElement;
}

export const dndStore = createZustandStore('dnd')({
  draggingIds: new Set<string>(),
  canDrop: false,
});

export const useDnd = ({ element }: UseDndNodeOptions) => {
  const { id, type } = element;

  const editor = useMyEditorRef();
  const elementRef = useRef<MyElement>(element);
  elementRef.current = element;

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

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return {
    isDragging,
    dragRef,
  };
};

export const useOnDragEnd = () => {
  return useCallback(() => plateDndStore.set.isDragging(false), []);
};
