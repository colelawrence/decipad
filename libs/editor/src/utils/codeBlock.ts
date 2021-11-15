import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  insertNodes,
  SPEditor,
  TDescendant,
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

export const insertCodeBlockBelow = (editor: SPEditor, path: Path): void => {
  insertNodes<TDescendant>(editor, codeBlockElement, {
    at: getPathBelowBlock(editor, path),
  });
};
