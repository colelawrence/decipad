import { MyEditor } from '@decipad/editor-types';
import { insertText, getEditorString } from '@udecode/plate';
import { BaseEditor, Range, Transforms, BasePoint, Editor } from 'slate';
import type { MenuItem } from './AutoCompleteMenu';

export const commitAutocompleteItem = (
  editor: MyEditor,
  at: Range,
  item: MenuItem
) => {
  const characterBefore = getCharacterBeforeCursor(editor, Range.start(at));

  Transforms.select(editor as BaseEditor, at);
  Transforms.delete(editor as BaseEditor);

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
    anchor: Editor.start(editor as BaseEditor, cursor.path),
    focus: { path: cursor.path, offset: cursor.offset },
  }).slice(-1);
