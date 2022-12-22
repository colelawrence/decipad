import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_CODE_LINE_V2_VARNAME,
  MyEditor,
  MyElement,
} from '@decipad/editor-types';
import { deleteText, getEditorString } from '@udecode/plate';
import { Path } from 'slate';
import {
  insertNodes,
  requireBlockParentPath,
  requirePathBelowBlock,
} from '@decipad/editor-utils';
import { nanoid } from 'nanoid';
import { isFlagEnabled } from '@decipad/feature-flags';

const codeLineElement = (): MyElement =>
  isFlagEnabled('CODE_LINE_NAME_SEPARATED')
    ? {
        id: nanoid(),
        type: ELEMENT_CODE_LINE_V2,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_CODE_LINE_V2_VARNAME,
            children: [{ text: '' }],
          },
          {
            id: nanoid(),
            type: ELEMENT_CODE_LINE_V2_CODE,
            children: [{ text: '' }],
          },
        ],
      }
    : {
        id: nanoid(),
        type: ELEMENT_CODE_LINE,
        children: [{ text: '' }],
      };

export const insertCodeLineBelow = (
  editor: MyEditor,
  path: Path,
  select = false
): void => {
  insertNodes(editor, codeLineElement(), {
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
