import {
  ElementKind,
  ELEMENT_LIC,
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
} from '@decipad/editor-types';
import { getNode, insertNodes, TEditor, TElement } from '@udecode/plate';
import { Editor, Path, Transforms } from 'slate';
import { getBlockParentPath, requirePathBelowBlock } from './path';

export const closestBlockAncestorHasType = (
  editor: TEditor,
  path: Path,
  type: ElementKind
): boolean => {
  const blockParentPath = getBlockParentPath(editor, path);
  if (!blockParentPath) {
    return false;
  }

  const block = getNode<TElement>(editor, blockParentPath);
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
  editor: Editor,
  path: Path | null
): boolean => {
  return path
    ? BLOCKS_ALLOWING_TEXT_STYLING.some((type) =>
        closestBlockAncestorHasType(editor, path, type)
      )
    : false;
};

export const insertDividerBelow = (
  editor: Editor,
  path: Path,
  type: ElementKind
): void => {
  const at = requirePathBelowBlock(editor, path);
  insertNodes<TElement>(editor, { type, children: [{ text: '' }] }, { at });

  const next = Editor.next(editor, { at });
  if (next) {
    const [, nextPath] = next;
    const end = Editor.end(editor, nextPath);
    Transforms.setSelection(editor, { anchor: end, focus: end });
  }
};

export const insertBlockOfTypeBelow = (
  editor: Editor,
  path: Path,
  type: ElementKind
): void => {
  insertNodes<TElement>(
    editor,
    { type, children: [{ text: '' }] },
    { at: requirePathBelowBlock(editor, path) }
  );
};
