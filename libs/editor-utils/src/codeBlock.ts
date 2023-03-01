import { ELEMENT_CODE_LINE_V2, MyEditor } from '@decipad/editor-types';
import { deleteText, getEditorString } from '@udecode/plate';
import { BaseEditor, Path, Transforms } from 'slate';
import { Computer } from '@decipad/computer';
import { createStructuredCodeLine, createCodeLine } from './createCodeLine';
import { insertNodes } from './insertNodes';
import { requireBlockParentPath, requirePathBelowBlock } from './path';

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

export const insertStructuredCodeLineBelow = ({
  editor,
  path,
  code = '',
  select = false,
  getAvailableIdentifier,
}: {
  editor: MyEditor;
  path: Path;
  select?: boolean;
  getAvailableIdentifier: Computer['getAvailableIdentifier'];
  code?: string;
}) => {
  const elm = createStructuredCodeLine({
    varName: getAvailableIdentifier('Name', 1),
    code,
  });

  const pathBelow = requirePathBelowBlock(editor, path);
  insertNodes(editor, elm, { at: pathBelow });

  if (select) {
    if (elm.type === ELEMENT_CODE_LINE_V2) {
      Transforms.select(editor as BaseEditor, [...pathBelow, 1]);
    } else {
      Transforms.select(editor as BaseEditor, [...pathBelow, 0]);
    }
  }
};

export const insertStructuredCodeLineBelowOrReplace = ({
  editor,
  path,
  code,
  select = false,
  getAvailableIdentifier,
}: {
  editor: MyEditor;
  path: Path;
  code?: string;
  select?: boolean;
  getAvailableIdentifier: Computer['getAvailableIdentifier'];
}) => {
  const blockPath = requireBlockParentPath(editor, path);
  const isBlockEmpty = !getEditorString(editor, blockPath);

  insertStructuredCodeLineBelow({
    editor,
    path: blockPath,
    code,
    select,
    getAvailableIdentifier,
  });
  if (isBlockEmpty) {
    deleteText(editor, { at: blockPath });
  }
};
