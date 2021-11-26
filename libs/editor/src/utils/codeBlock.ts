import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  insertNodes,
  TDescendant,
  TEditor,
} from '@udecode/plate';
import { Path } from 'slate';
import { getPathBelowBlock } from './path';

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
    at: getPathBelowBlock(editor, path),
    select,
  });
};
