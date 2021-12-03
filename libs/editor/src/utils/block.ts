import { getNode, insertNodes, TEditor, TElement } from '@udecode/plate';
import { Editor, Path } from 'slate';
import { ElementType } from './elementTypes';
import { getBlockParentPath, getPathBelowBlock } from './path';

export const closestBlockAncestorHasType = (
  editor: TEditor,
  path: Path,
  type: ElementType
): boolean => {
  const block = getNode<TElement>(editor, getBlockParentPath(editor, path));
  if (!block) {
    throw new Error('Cannot find node at the block path');
  }
  return block.type === type;
};

export const insertBlockOfTypeBelow = (
  editor: Editor,
  path: Path,
  type: ElementType
): void => {
  insertNodes<TElement>(
    editor,
    { type, children: [{ text: '' }] },
    { at: getPathBelowBlock(editor, path) }
  );
};
