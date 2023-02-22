import { MyEditor } from '@decipad/editor-types';
import {
  deleteText,
  getEditorString,
  getStartPoint,
  insertText,
  select,
} from '@udecode/plate';
import { BasePoint, Range } from 'slate';
import type { MenuItem } from './AutoCompleteMenu';

export const commitAutocompleteItem = (
  editor: MyEditor,
  at: Range,
  item: MenuItem
) => {
  const characterBefore = getCharacterBeforeCursor(editor, Range.start(at));

  select(editor, at);
  deleteText(editor);

  if (needsSpaceAfter(characterBefore)) {
    insertText(editor, ' ');
  }

  insertText(editor, item.identifier);

  if (item.kind !== 'function') {
    insertText(editor, ' ');
  }
};

const needsSpaceAfter = (character: string) =>
  !['', ' ', '(', ')', '[', ']', '{', '}'].includes(character);

const getCharacterBeforeCursor = (editor: MyEditor, cursor: BasePoint) =>
  getEditorString(editor, {
    anchor: getStartPoint(editor, cursor.path),
    focus: { path: cursor.path, offset: cursor.offset },
  }).slice(-1);
