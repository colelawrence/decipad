import { insertNodes, TDescendant, TEditor } from '@udecode/plate';
import { Editor, Path, Transforms } from 'slate';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { requireBlockParentPath, requirePathBelowBlock } from './path';

const codeBlockElement = {
  type: ELEMENT_CODE_BLOCK,
  children: [
    {
      type: ELEMENT_CODE_LINE,
      children: [{ text: '' }],
    },
  ],
} as const;

export const insertCodeBlockBelow = (
  editor: TEditor,
  path: Path,
  select = false
): void => {
  insertNodes<TDescendant>(editor, codeBlockElement, {
    at: requirePathBelowBlock(editor, path),
    select,
  });
};

export const insertCodeBlockBelowOrReplace = (
  editor: TEditor,
  path: Path,
  select = false
): void => {
  const blockPath = requireBlockParentPath(editor, path);
  const isBlockEmpty = !Editor.string(editor, blockPath);

  insertCodeBlockBelow(editor, blockPath, select);
  if (isBlockEmpty) {
    Transforms.delete(editor, { at: blockPath });
  }
};
