import {
  CodeLineElement,
  ELEMENT_CODE_LINE,
  MyEditor,
} from '@decipad/editor-types';
import { deleteText, getEditorString, insertNodes } from '@udecode/plate';
import { Path } from 'slate';
import {
  requireBlockParentPath,
  requirePathBelowBlock,
} from '@decipad/editor-utils';
import { nanoid } from 'nanoid';

const codeLineElement = (): CodeLineElement => ({
  id: nanoid(),
  type: ELEMENT_CODE_LINE,
  children: [{ text: '' }],
});

export const insertCodeLineBelow = (
  editor: MyEditor,
  path: Path,
  select = false
): void => {
  insertNodes<CodeLineElement>(editor, codeLineElement(), {
    at: requirePathBelowBlock(editor, path),
    select,
  });
};

export const insertCodeLineBelowOrReplace = (
  editor: MyEditor,
  path: Path,
  select = false
): void => {
  const blockPath = requireBlockParentPath(editor, path);
  const isBlockEmpty = !getEditorString(editor, blockPath);

  insertCodeLineBelow(editor, blockPath, select);
  if (isBlockEmpty) {
    deleteText(editor, { at: blockPath });
  }
};
