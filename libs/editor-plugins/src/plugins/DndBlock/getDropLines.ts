import type { MyEditor } from '@decipad/editor-types';
import { COLUMN_KINDS, ELEMENT_COLUMNS } from '@decipad/editor-types';
import { getNode, getNodeChildren } from '@udecode/plate-common';
import { getNodeDropLinePositions } from './getNodeDropLinePositions';
import type { DropLine } from './types';

export interface GetDropLinesOptions {
  allowColumns?: boolean;
  draggingIds?: string[];
}

export const getDropLines = (
  editor: MyEditor,
  { allowColumns = true, draggingIds = [] }: GetDropLinesOptions = {}
): DropLine[] => {
  const editorChildren = Array.from(getNodeChildren(editor, []));

  let previousWasBeingDragged = false;

  const horizontalDropLines: DropLine[] = editorChildren.flatMap(
    ([node, path]) => {
      /**
       * Do not return a drop line between a pair of nodes that are both being
       * dragged.
       */
      const isBeingDragged = draggingIds.includes(node.id);
      const isPairOfDraggedNodes = isBeingDragged && previousWasBeingDragged;
      previousWasBeingDragged = isBeingDragged;
      if (isPairOfDraggedNodes) {
        return [];
      }

      const positions = getNodeDropLinePositions(editor, node, path);
      if (!positions) return [];

      const { top, left, right } = positions;
      const crossAxis = { start: left, end: right };

      const dropLineAbove: DropLine = {
        type: 'horizontal',
        id: node.id,
        path,
        direction: 'before',
        mainAxis: top,
        crossAxis,
        confineToCrossAxis: false,
      };

      return [dropLineAbove];
    }
  );

  type PartialVerticalDropLine = Pick<
    DropLine,
    'type' | 'id' | 'path' | 'direction' | 'confineToCrossAxis'
  >;

  const partialVerticalDropLines: PartialVerticalDropLine[] = allowColumns
    ? editorChildren.flatMap(([node, path]) => {
        // Can't drag a node into a column with itself
        if (draggingIds.includes(node.id)) return [];

        /**
         * If the node is a group of columns, we want to return drop lines
         * to the left and right of each column.
         */
        if (node.type === ELEMENT_COLUMNS) {
          const nodeChildren = Array.from(getNodeChildren(editor, path));

          return nodeChildren.flatMap(([childNode, childPath]) =>
            (['before', 'after'] as const).map((direction) => ({
              type: 'vertical',
              id: childNode.id,
              path: childPath,
              direction,
              confineToCrossAxis: true,
            }))
          );
        }

        /**
         * Otherwise, if the node can form part of a column, return a drop line
         * either side of it.
         */
        if (COLUMN_KINDS.includes(node.type)) {
          return (['before', 'after'] as const).map((direction) => ({
            type: 'vertical',
            id: node.id,
            path,
            direction,
            confineToCrossAxis: true,
          }));
        }

        return [];
      })
    : [];

  const verticalDropLines: DropLine[] = partialVerticalDropLines.flatMap(
    (partialDropLine) => {
      const { path, direction } = partialDropLine;

      const node = getNode(editor, path);
      if (!node) return [];
      const positions = getNodeDropLinePositions(editor, node, path);
      if (!positions) return [];
      const { left, right, top, bottom } = positions;

      return [
        {
          ...partialDropLine,
          mainAxis: direction === 'before' ? left : right,
          crossAxis: { start: top, end: bottom },
        },
      ];
    }
  );

  return [...horizontalDropLines, ...verticalDropLines];
};
