import { getNode, insertNodes, TEditor, TElement } from '@udecode/plate';
import { Editor, Path } from 'slate';
import { ElementKind, ELEMENT_PARAGRAPH, ELEMENT_LIC } from '../elements';
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
