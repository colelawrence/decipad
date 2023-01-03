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
import { Computer } from '@decipad/computer';

const codeLineElement = (
  getAvailableIdentifier: Computer['getAvailableIdentifier']
): MyElement =>
  isFlagEnabled('CODE_LINE_NAME_SEPARATED')
    ? {
        id: nanoid(),
        type: ELEMENT_CODE_LINE_V2,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_CODE_LINE_V2_VARNAME,
            children: [{ text: getAvailableIdentifier('Name', 1) }],
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
  select: boolean,
  getAvailableIdentifier: Computer['getAvailableIdentifier']
): void => {
  insertNodes(editor, codeLineElement(getAvailableIdentifier), {
    at: requirePathBelowBlock(editor, path),
    select,
  });
};

export const insertCodeLineBelowOrReplace = (
  editor: MyEditor,
  path: Path,
  select: boolean,
  getAvailableIdentifier: Computer['getAvailableIdentifier']
): void => {
  const blockPath = requireBlockParentPath(editor, path);
  const isBlockEmpty = !getEditorString(editor, blockPath);

  insertCodeLineBelow(editor, blockPath, select, getAvailableIdentifier);
  if (isBlockEmpty) {
    deleteText(editor, { at: blockPath });
  }
};
