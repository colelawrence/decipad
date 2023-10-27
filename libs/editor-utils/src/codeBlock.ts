import { Computer } from '@decipad/computer';
import { ELEMENT_CODE_LINE_V2, MyEditor, MyValue } from '@decipad/editor-types';
import { isFlagEnabled } from '@decipad/feature-flags';
import { generateVarName } from '@decipad/utils';
import {
  EElementOrText,
  PlateEditor,
  Value,
  deleteText,
  getEditorString,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { BaseEditor, Path, Transforms } from 'slate';
import { createCodeLine, createStructuredCodeLine } from './createCodeLine';
import { insertNodes } from './insertNodes';
import { requireBlockParentPath, requirePathBelowBlock } from './path';

export const insertCodeLineBelow = (
  editor: MyEditor,
  path: Path,
  select: boolean
) => {
  const elm = createCodeLine({ code: '' });

  insertNodes(editor, [elm], {
    at: requirePathBelowBlock(editor, path),
    select,
  });
};

export const insertStructuredCodeLineBelow = <
  TV extends Value = MyValue,
  TE extends PlateEditor<TV> = PlateEditor<TV>
>({
  editor,
  path,
  code = '',
  varName,
  select = false,
  getAvailableIdentifier,
}: {
  editor: TE;
  path: Path;
  select?: boolean;
  getAvailableIdentifier: Computer['getAvailableIdentifier'];
  code?: string;
  varName?: string;
}): string => {
  const newId = nanoid();
  const elm = createStructuredCodeLine({
    id: newId,
    varName: getAvailableIdentifier(
      varName ?? generateVarName(isFlagEnabled('SILLY_NAMES')),
      1
    ),
    code,
  }) as EElementOrText<TV>;

  const pathBelow = requirePathBelowBlock(editor, path);
  insertNodes(editor, [elm], { at: pathBelow });

  if (select) {
    if (elm.type === ELEMENT_CODE_LINE_V2) {
      Transforms.select(editor as BaseEditor, [...pathBelow, 1]);
    } else {
      Transforms.select(editor as BaseEditor, [...pathBelow, 0]);
    }
  }
  return newId;
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
