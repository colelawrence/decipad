import { findNode, isElement, wrapNodes } from '@udecode/plate-common';
import { Path } from 'slate';
import type {
  ColumnableElement,
  LayoutElement,
  MyEditor,
} from '@decipad/editor-types';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_LAYOUT,
  ELEMENT_PARAGRAPH,
  ELEMENT_VARIABLE_DEF,
  UNCOLUMNABLE_KINDS,
  topLevelBlockKinds,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { getAboveNodeSafe } from './getAboveNodeSafe';
import { insertNodes } from './insertNodes';
import { requirePathBelowBlock } from './path';

type ColumnableElementKind = ColumnableElement['type'];

export const isColumnableKind = <K extends string>(
  kind: K
): K extends ColumnableElementKind
  ? true
  : string extends K
  ? boolean
  : false =>
  (topLevelBlockKinds.includes(kind) &&
    !UNCOLUMNABLE_KINDS.includes(kind as any)) as any;

const showColumnBorderKinds: ColumnableElementKind[] = [
  ELEMENT_PARAGRAPH,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_BLOCKQUOTE,
];

export const showColumnBorder = (elementType: ColumnableElementKind) =>
  showColumnBorderKinds.includes(elementType);

const defaultMinColumnWidth = 150;

const minColumnWidths: Partial<Record<ColumnableElementKind, number>> = {
  [ELEMENT_VARIABLE_DEF]: 185,
  [ELEMENT_CODE_LINE_V2]: 300,
};

export const minColumnWidth = (elementType: ColumnableElementKind) =>
  minColumnWidths[elementType] ?? defaultMinColumnWidth;

export const hasLayoutAncestor = (editor: MyEditor, path: Path): boolean => {
  return !!getAboveNodeSafe(editor, {
    at: path,
    match: (node) => isElement(node) && node.type === ELEMENT_LAYOUT,
  });
};

export const wrapIntoLayout = (
  editor: MyEditor,
  path: Path,
  width?: LayoutElement['width']
) => {
  const hasLayoutAncestorElement = hasLayoutAncestor(editor, path);
  if (!hasLayoutAncestorElement) {
    wrapNodes(
      editor,
      {
        id: nanoid(),
        type: ELEMENT_LAYOUT,
        width,
      } as LayoutElement,
      { at: path }
    );
  }
};

export const insertLayoutBelow = (editor: MyEditor, path: Path) => {
  // Copy width and column widths from previous layout if present
  const previousLayout =
    path[0] === 0
      ? undefined
      : findNode<LayoutElement>(editor, {
          match: { type: ELEMENT_LAYOUT },
          at: Path.previous(path.slice(0, 1)),
        })?.[0];

  const width = previousLayout?.width;

  const children = (previousLayout?.children ?? [undefined, undefined]).map(
    (child) =>
      ({
        id: nanoid(),
        columnWidth: child?.columnWidth,
        type: ELEMENT_PARAGRAPH,
        children: [{ text: '' }],
      } satisfies ColumnableElement)
  ) as LayoutElement['children'];

  const layout: LayoutElement = {
    id: nanoid(),
    type: ELEMENT_LAYOUT,
    width,
    children,
  };

  insertNodes(editor, [layout], {
    at: requirePathBelowBlock(editor, path),
  });
};

export const isEmptyColumn = (element: ColumnableElement): boolean =>
  element.type === ELEMENT_PARAGRAPH &&
  element.children.length === 1 &&
  (element.children[0].text as string).trim().length === 0;
