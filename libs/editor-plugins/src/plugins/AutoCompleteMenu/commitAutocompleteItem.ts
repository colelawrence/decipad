import {
  ELEMENT_SMART_REF,
  MyEditor,
  SmartRefElement,
} from '@decipad/editor-types';
import { insertNodes } from '@decipad/editor-utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import {
  deleteText,
  getEditorString,
  getPointBefore,
  getStartPoint,
  insertText,
  nanoid,
  select,
  setSelection,
} from '@udecode/plate';
import { BasePoint, Range } from 'slate';
import type { MenuItem } from './AutoCompleteMenu';

export const commitAutocompleteItem = (
  editor: MyEditor,
  at: Range,
  item: MenuItem
) => {
  const pointBefore = Range.start(at);
  const characterBefore = getCharacterBeforeCursor(editor, pointBefore);

  select(editor, at);
  deleteText(editor);

  let toInsert = '';

  if (needsSpaceAfter(characterBefore)) {
    toInsert += ' ';
  }

  toInsert += item.identifier;

  let moveCursorBack;
  if (item.kind !== 'function') {
    toInsert += ' ';
    moveCursorBack = false;
  } else {
    toInsert += '()';
    moveCursorBack = true;
  }

  if (!isFlagEnabled('AC_MENU_INSERT_SMART_REF') || !item.blockId) {
    insertText(editor, toInsert);
  } else {
    const smartRef: SmartRefElement = {
      id: nanoid(),
      type: ELEMENT_SMART_REF,
      blockId: item.blockId,
      columnId: item.columnId || null,
      children: [{ text: '' }],
    };
    insertNodes(editor, smartRef);
  }

  // Move cursor to before the closing parenthesis
  if (editor.selection?.focus && moveCursorBack) {
    const pointToMoveTo = getPointBefore(editor, editor.selection.focus, {
      distance: 1,
      unit: 'character',
    });
    setSelection(editor, { anchor: pointToMoveTo, focus: pointToMoveTo });
  }
};

const needsSpaceAfter = (character: string) =>
  !['', ' ', '(', ')', '[', ']', '{', '}'].includes(character);

const getCharacterBeforeCursor = (editor: MyEditor, cursor: BasePoint) =>
  getEditorString(editor, {
    anchor: getStartPoint(editor, cursor.path),
    focus: { path: cursor.path, offset: cursor.offset },
  }).slice(-1);
