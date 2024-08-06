import type { LayoutElement, MyEditor, MyElement } from '@decipad/editor-types';
import { ELEMENT_LAYOUT } from '@decipad/editor-types';
import { getNodeChildren, toDOMNode } from '@udecode/plate-common';
import type { DropArea, DropLine, DropLocation } from './types';
import { findElementById, isColumnableKind } from '@decipad/editor-utils';
import { blockGap, columnGap } from './constants';
import { getNodeRect } from './getNodeRect';

export interface GetDropLocationsOptions {
  allowColumns?: boolean;
  allowDragOntoOwnMargin?: boolean;
  draggingIds?: string[];
}

export const getDropLocations = (
  editor: MyEditor,
  options: GetDropLocationsOptions = {}
): DropLocation[] => {
  const horizontalDropLines = getHorizontalDropLines(editor, options);
  const verticalDropLines = options.allowColumns
    ? getVerticalDropLines(editor, options)
    : [];
  const dropAreas = getDropAreas(editor, options);
  return [...horizontalDropLines, ...verticalDropLines, ...dropAreas];
};

const getHorizontalDropLines = (
  editor: MyEditor,
  { draggingIds = [] }: GetDropLocationsOptions
): DropLine[] => {
  const editorChildren = Array.from(getNodeChildren(editor, []));

  const blocks = editorChildren.flatMap((entry) => {
    const returnBlocks = [entry];
    const [node, path] = entry;

    if (node.type === ELEMENT_LAYOUT) {
      const domNode = toDOMNode(editor, node);
      if (domNode && domNode.dataset.layout === 'rows') {
        returnBlocks.push(...getNodeChildren(editor, path));
      }
    }

    return returnBlocks;
  });

  let previousWasBeingDragged = false;
  let previousYEnd: number | null = null;

  return blocks.flatMap(([node, path]) => {
    const rect = getNodeRect(editor, node);
    if (!rect) return [];

    const { xStart, xEnd, yStart, yEnd } = rect;

    const yBetween =
      previousYEnd === null
        ? yStart - blockGap / 2
        : (yStart + previousYEnd) / 2;

    previousYEnd = yEnd;

    /**
     * Do not return a drop line between a pair of nodes that are both being
     * dragged.
     */
    const isBeingDragged = draggingIds.includes(node.id ?? '');
    const isPairOfDraggedNodes = isBeingDragged && previousWasBeingDragged;
    previousWasBeingDragged = isBeingDragged;
    if (isPairOfDraggedNodes) {
      return [];
    }
    const crossAxis = { start: xStart, end: xEnd };

    const dropLineAbove: DropLine = {
      type: 'horizontalDropLine',
      id: node.id ?? '',
      path,
      direction: 'before',
      mainAxis: yBetween,
      crossAxis,
      confineToCrossAxis: false,
    };

    return [dropLineAbove];
  });
};

type PartialVerticalDropLine = Pick<
  DropLine,
  'type' | 'id' | 'path' | 'direction' | 'confineToCrossAxis'
> & {
  node: MyElement;
  layoutNode?: LayoutElement;
};

const getVerticalDropLines = (
  editor: MyEditor,
  { draggingIds = [] }: GetDropLocationsOptions
): DropLine[] => {
  const editorChildren = Array.from(getNodeChildren(editor, []));

  const partialVerticalDropLines = editorChildren.flatMap(
    ([node, path]): PartialVerticalDropLine[] => {
      // Can't drag a node into a column with itself
      if (draggingIds.includes(node.id ?? '')) return [];

      /**
       * If the node is a group of columns, we want to return drop lines
       * to the left and right of each column.
       */
      if (node.type === ELEMENT_LAYOUT) {
        const domNode = toDOMNode(editor, node);

        if (!domNode || domNode.dataset.layout !== 'columns') {
          return [];
        }

        const nodeChildren = Array.from(getNodeChildren(editor, path));

        return nodeChildren.flatMap(([childNode, childPath], index) => {
          const isLast = index === nodeChildren.length - 1;

          const directions: ('before' | 'after')[] = isLast
            ? ['before', 'after']
            : ['before'];

          return directions.map((direction) => ({
            type: 'verticalDropLine',
            id: childNode.id ?? '',
            node: childNode,
            path: childPath,
            layoutNode: node,
            direction,
            confineToCrossAxis: true,
          }));
        });
      }

      /**
       * Otherwise, if the node can form part of a column, return a drop line
       * either side of it.
       */
      if (isColumnableKind(node.type)) {
        return (['before', 'after'] as const).map((direction) => ({
          type: 'verticalDropLine',
          id: node.id ?? '',
          node,
          path,
          direction,
          confineToCrossAxis: true,
        }));
      }

      return [];
    }
  );

  const previousXEnd: number | null = null;

  return partialVerticalDropLines.flatMap(
    ({ node, layoutNode, ...partialDropLine }) => {
      const { direction } = partialDropLine;

      const rect = getNodeRect(editor, node);
      if (!rect) return [];

      const xRef = direction === 'before' ? rect.xStart : rect.xEnd;
      const xDirection = direction === 'before' ? -1 : 1;

      const xBetween =
        direction === 'after' || previousXEnd === null
          ? xRef + (xDirection * columnGap) / 2
          : (xRef + previousXEnd) / 2;

      const layoutRect = layoutNode ? getNodeRect(editor, layoutNode) : null;

      const layoutOrSelfRect = layoutRect ?? rect;

      return [
        {
          ...partialDropLine,
          mainAxis: xBetween,
          crossAxis: {
            start: layoutOrSelfRect.yStart - blockGap / 2,
            end: layoutOrSelfRect.yEnd + blockGap / 2,
          },
        },
      ];
    }
  );
};

const getDropAreas = (
  editor: MyEditor,
  { draggingIds = [], allowDragOntoOwnMargin }: GetDropLocationsOptions
): DropArea[] => {
  if (!allowDragOntoOwnMargin) return [];

  if (draggingIds.length !== 1) return [];
  const itemId = draggingIds[0];

  const entry = findElementById<MyElement>(editor, itemId);
  if (!entry) return [];

  const [node, path] = entry;

  const nodeRect = getNodeRect(editor, node);
  if (!nodeRect) return [];

  const editorRect = toDOMNode(
    editor,
    editor
  )?.parentElement?.getBoundingClientRect();
  if (!editorRect) return [];

  return [
    {
      type: 'dropArea',
      id: node.id ?? '',
      path,
      rects: [
        // Left
        {
          xStart: editorRect.left,
          xEnd: nodeRect.xStart - columnGap,
          yStart: nodeRect.yStart,
          yEnd: nodeRect.yEnd,
        },
        // Right
        {
          xStart: nodeRect.xEnd + columnGap,
          xEnd: editorRect.right,
          yStart: nodeRect.yStart,
          yEnd: nodeRect.yEnd,
        },
      ],
    },
  ];
};
