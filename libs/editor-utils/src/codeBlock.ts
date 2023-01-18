import { MyEditor } from '@decipad/editor-types';
import { deleteText, getEditorString } from '@udecode/plate';
import { Path } from 'slate';
import {
  insertNodes,
  requireBlockParentPath,
  requirePathBelowBlock,
} from '@decipad/editor-utils';
import { Computer } from '@decipad/computer';
import { createStructuredCodeLine, createCodeLine } from './createCodeLine';

export const insertCodeLineBelow = (
  editor: MyEditor,
  path: Path,
  select: boolean
) => {
  const elm = createCodeLine({ code: '' });

  insertNodes(editor, elm, {
    at: requirePathBelowBlock(editor, path),
    select,
  });
};

export const insertStructuredCodeLineBelow = (
  editor: MyEditor,
  path: Path,
  select: boolean,
  getAvailableIdentifier: Computer['getAvailableIdentifier']
) => {
  const elm = createStructuredCodeLine({
    varName: getAvailableIdentifier('Name', 1),
  });

  insertNodes(editor, elm, {
    at: requirePathBelowBlock(editor, path),
    select,
  });
};

export const insertStructuredCodeLineBelowOrReplace = (
  editor: MyEditor,
  path: Path,
  select: boolean,
  getAvailableIdentifier: Computer['getAvailableIdentifier']
) => {
  const blockPath = requireBlockParentPath(editor, path);
  const isBlockEmpty = !getEditorString(editor, blockPath);

  insertStructuredCodeLineBelow(
    editor,
    blockPath,
    select,
    getAvailableIdentifier
  );
  if (isBlockEmpty) {
    deleteText(editor, { at: blockPath });
  }
};
