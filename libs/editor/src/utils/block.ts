import { insertNodes, TElement } from '@udecode/plate';
import { Editor, Path } from 'slate';
import { ElementType } from './elementTypes';
import { getPathBelowBlock } from './path';

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
