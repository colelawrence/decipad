import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_IMAGE,
  ELEMENT_INLINE_NUMBER,
  ELEMENT_LIC,
  ELEMENT_PARAGRAPH,
  ElementKind,
  InlineNumberElement,
  MyEditor,
  MyElement,
} from '@decipad/editor-types';
import {
  getEndPoint,
  getNextNode,
  getNode,
  insertNodes,
  setSelection,
  TDescendant,
  TElement,
} from '@udecode/plate';
import { Path } from 'slate';
import {
  getBlockParentPath,
  getNonTextParentPath,
  requirePathBelowBlock,
} from './path';
import { getPathContainingSelection } from './selection';

export const closestBlockAncestorHasType = (
  editor: MyEditor,
  path: Path,
  type: ElementKind
): boolean => {
  const blockParentPath = getBlockParentPath(editor, path);
  if (!blockParentPath) {
    return false;
  }

  const block = getNode<MyElement>(editor, blockParentPath);
  if (!block) {
    throw new Error('Cannot find node at the block path');
  }
  return block.type === type;
};

export const closestElementAncestorHasType = (
  editor: MyEditor,
  path: Path,
  type: ElementKind
) => {
  const elementParentPath = getNonTextParentPath(editor, path);
  if (!elementParentPath) {
    return false;
  }

  const block = getNode<MyElement>(editor, elementParentPath);
  if (!block) {
    throw new Error('Cannot find node at the block path');
  }

  return block.type === type;
};

const BLOCKS_ALLOWING_TEXT_STYLING: ReadonlyArray<ElementKind> = [
  ELEMENT_PARAGRAPH,
  ELEMENT_LIC,
  ELEMENT_BLOCKQUOTE,
];

export const allowsTextStyling = (
  editor: MyEditor,
  path: Path | null
): boolean => {
  return path
    ? BLOCKS_ALLOWING_TEXT_STYLING.some((type) =>
        closestBlockAncestorHasType(editor, path, type)
      )
    : false;
};

export const selectionIsNotBubble = (editor: MyEditor): boolean => {
  const path = getPathContainingSelection(editor);
  return path
    ? !closestElementAncestorHasType(editor, path, ELEMENT_INLINE_NUMBER)
    : false;
};

export const getSelectionBubble = (
  editor: MyEditor
): InlineNumberElement | null => {
  const path = getPathContainingSelection(editor);
  if (!path) return null;

  const blockParentPath = getNonTextParentPath(editor, path);
  if (!blockParentPath) return null;

  const element = getNode<MyElement>(editor, blockParentPath);

  if (element == null) return null;
  if (element.type !== ELEMENT_INLINE_NUMBER) return null;

  return element;
};

export const insertDividerBelow = (
  editor: MyEditor,
  path: Path,
  type: ElementKind
): void => {
  const at = requirePathBelowBlock(editor, path);
  insertNodes<TElement>(editor, { type, children: [{ text: '' }] }, { at });

  const next = getNextNode(editor, { at });
  if (next) {
    const [, nextPath] = next;
    const end = getEndPoint(editor, nextPath);
    setSelection(editor, { anchor: end, focus: end });
  }
};

export const insertBlockOfTypeBelow = (
  editor: MyEditor,
  path: Path,
  type: ElementKind
): void => {
  insertNodes<TElement>(
    editor,
    { type, children: [{ text: '' }] },
    { at: requirePathBelowBlock(editor, path) }
  );
};

export const insertImageBelow = (
  editor: MyEditor,
  path: Path,
  url: string,
  alt = ''
): void => {
  insertNodes<TElement>(
    editor,
    { type: ELEMENT_IMAGE, children: [{ text: alt } as TDescendant], url },
    { at: requirePathBelowBlock(editor, path) }
  );
};
